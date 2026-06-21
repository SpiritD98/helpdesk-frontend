import { Component, ChangeDetectionStrategy, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { Subject, EMPTY, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { CategoriaApiService } from '../../../core/services/categoria-api.service';
import { Categoria, CategoriaRequest } from '../../../core/models/categoria.model';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, ReactiveFormsModule,
  ],
  template: `
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Categorías</h1>
      <button mat-flat-button color="primary" (click)="abrirForm()">
        <mat-icon>add</mat-icon> Nueva Categoría
      </button>
    </div>
    <div class="mb-4">
      <mat-form-field appearance="outline" class="min-w-[300px]" subscriptSizing="dynamic">
        <mat-label>Buscar por nombre o descripción</mat-label>
        <input
          matInput
          placeholder="Buscar por nombre o descripción..."
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearchChange($event)"
          autocomplete="off"
        />
        @if (searchTerm().length > 0) {
          <button matSuffix mat-icon-button (click)="limpiarBusqueda()" type="button">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>
    </div>
    <mat-card>
      <mat-card-content>
        @if (loading()) {
          <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div>
        } @else if (items.length === 0) {
          <div class="text-center py-8 text-gray-500">
            {{ searchTerm() ? 'No se encontraron categorías con ese término.' : 'No hay categorías registradas.' }}
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b text-sm font-medium text-gray-600">
                  <th class="py-3 px-4">Nombre</th>
                  <th class="py-3 px-4">Descripción</th>
                  <th class="py-3 px-4">Estado</th>
                  <th class="py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (c of items; track c.id) {
                  <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">{{ c.nombre }}</td>
                    <td class="py-3 px-4">{{ c.descripcion }}</td>
                    <td class="py-3 px-4">
                      <span class="badge" [ngClass]="c.activa ? 'badge-resuelto' : 'badge-cerrado'">
                        {{ c.activa ? 'Activa' : 'Inactiva' }}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <button mat-icon-button (click)="eliminar(c)"><mat-icon color="warn">delete</mat-icon></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between mt-4 flex-wrap gap-3">
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600">Items por página:</span>
              <mat-select
                class="w-20"
                [value]="limit"
                (selectionChange)="onLimitChange($event.value)"
              >
                <mat-option [value]="5">5</mat-option>
                <mat-option [value]="10">10</mat-option>
                <mat-option [value]="15">15</mat-option>
                <mat-option [value]="20">20</mat-option>
              </mat-select>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-sm text-gray-600">
                Página {{ currentPage }} de {{ totalPages }} | Total: {{ totalItems }} categorías
              </span>
              <div class="flex gap-1">
                <button
                  mat-stroked-button
                  [disabled]="currentPage === 1"
                  (click)="irAPagina(currentPage - 1)"
                >&lt;</button>
                <button
                  mat-stroked-button
                  [disabled]="currentPage === totalPages"
                  (click)="irAPagina(currentPage + 1)"
                >&gt;</button>
              </div>
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class CategoriaListComponent implements OnInit, OnDestroy {
  private api = inject(CategoriaApiService);
  private auth = inject(AuthService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  protected loading = signal(true);
  protected searchTerm = signal('');
  protected items: Categoria[] = [];
  protected currentPage = 1;
  protected limit = 5;
  protected totalItems = 0;
  protected totalPages = 0;

  private fetchTrigger = new Subject<void>();
  private searchSubj = new Subject<string>();
  private subs = [
    this.searchSubj.pipe(debounceTime(300), distinctUntilChanged()).subscribe(search => {
      this.searchTerm.set(search);
      this.currentPage = 1;
      this.fetchTrigger.next();
    }),
    this.fetchTrigger.pipe(
      switchMap(() => {
        this.loading.set(true);
        const rol = this.auth.user()?.rol;
        const eid = this.auth.getEmpresaId();
        const search = this.searchTerm() || undefined;
        if (rol === 'ADMIN_OWNER') return this.api.buscarPaginadoGlobal(this.currentPage, this.limit, search);
        if (eid) return this.api.buscarPaginado(eid, this.currentPage, this.limit, search);
        this.loading.set(false);
        return EMPTY;
      })
    ).subscribe({
      next: (res) => {
        this.items = res.data;
        this.totalItems = res.total;
        this.currentPage = res.page;
        this.totalPages = res.totalPages;
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    }),
  ];

  ngOnInit(): void { this.fetchTrigger.next(); }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  onSearchChange(val: string): void { this.searchSubj.next(val); }

  limpiarBusqueda(): void {
    this.searchTerm.set('');
    this.currentPage = 1;
    this.fetchTrigger.next();
  }

  onLimitChange(limit: number): void {
    this.limit = limit;
    this.currentPage = 1;
    this.fetchTrigger.next();
  }

  irAPagina(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchTrigger.next();
  }

  abrirForm(): void {
    const ref = this.dialog.open(CategoriaFormDialog, { width: '400px' });
    ref.afterClosed().subscribe((payload?: CategoriaRequest) => {
      if (payload) {
        const eid = this.auth.getEmpresaId()!;
        this.api.guardar(payload, eid).subscribe({
          next: () => { this.snack.open('Categoría creada', 'OK', { duration: 2000, panelClass: ['snack-success'] }); this.fetchTrigger.next(); },
        });
      }
    });
  }

  eliminar(c: Categoria): void {
    if (!confirm(`¿Desactivar ${c.nombre}?`)) return;
    const eid = this.auth.getEmpresaId()!;
    this.api.eliminar(c.id, eid).subscribe({
      next: () => { this.snack.open('Categoría desactivada', 'OK', { duration: 2000, panelClass: ['snack-success'] }); this.fetchTrigger.next(); },
    });
  }
}

@Component({
  selector: 'app-categoria-form-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Nueva Categoría</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="flex flex-col gap-2">
        <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="nombre" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Descripción</mat-label><input matInput formControlName="descripcion" /></mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" [mat-dialog-close]="form.getRawValue()">Crear</button>
    </mat-dialog-actions>
  `,
})
export class CategoriaFormDialog {
  private fb = inject(FormBuilder);
  protected ref = inject(MatDialogRef<CategoriaFormDialog>);
  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    descripcion: [''],
  });
}
