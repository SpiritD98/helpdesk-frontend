import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { RolApiService } from '../../../core/services/rol-api.service';
import { PermisoApiService } from '../../../core/services/permiso-api.service';
import { Rol } from '../../../core/models/rol.model';
import { Permiso } from '../../../core/models/permiso.model';

@Component({
  selector: 'app-rol-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatTableModule, MatChipsModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatCheckboxModule, ReactiveFormsModule,
  ],
  template: `
    <h1 class="text-2xl font-bold mb-4">Roles</h1>
    @if (loading()) {
      <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div>
    } @else {
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (r of roles(); track r.id) {
          <mat-card>
            <mat-card-header>
              <mat-card-title>{{ r.nombre }}</mat-card-title>
              <mat-card-subtitle>
                <span class="badge" [ngClass]="r.activo ? 'badge-resuelto' : 'badge-cerrado'">
                  {{ r.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <p class="text-sm text-gray-600 mb-2">Permisos: {{ r.permisos?.length || 0 }}</p>
              <button mat-stroked-button (click)="abrirPermisos(r)">
                <mat-icon>key</mat-icon> Gestionar Permisos
              </button>
            </mat-card-content>
          </mat-card>
        }
      </div>
    }
  `,
})
export class RolListComponent implements OnInit {
  private api = inject(RolApiService);
  private dialog = inject(MatDialog);
  protected loading = signal(true);
  protected roles = signal<Rol[]>([]);

  ngOnInit(): void {
    this.api.listarTodos().subscribe({
      next: (rs) => { this.roles.set(rs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  abrirPermisos(r: Rol): void {
    this.dialog.open(RolPermisosDialog, {
      data: { rolId: r.id, nombreRol: r.nombre },
      width: '500px',
      maxHeight: '80vh',
    });
  }
}

@Component({
  selector: 'app-rol-permisos-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatCheckboxModule, FormsModule, MatProgressSpinnerModule],
  template: `
    <h2 mat-dialog-title>Permisos de {{ data.nombreRol }}</h2>
    <mat-dialog-content>
      @if (loading()) {
        <div class="flex justify-center py-6"><mat-spinner diameter="32"></mat-spinner></div>
      } @else {
        <div class="flex flex-col gap-2 max-h-96 overflow-y-auto">
          @for (p of permisos(); track p.id) {
            <mat-checkbox [checked]="seleccionados.has(p.id)" (change)="toggle(p.id, $event.checked)">
              <span class="font-medium">{{ p.nombre }}</span>
              <span class="text-xs text-gray-500 block">{{ p.descripcion }}</span>
            </mat-checkbox>
          }
          @if (permisos().length === 0) {
            <p class="text-sm text-gray-500">No hay permisos activos en el sistema.</p>
          }
        </div>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="saving()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="guardar()" [disabled]="saving() || loading()">
        @if (saving()) { <mat-spinner diameter="18" class="mr-2 inline-block"></mat-spinner> }
        Guardar
      </button>
    </mat-dialog-actions>
  `,
})
export class RolPermisosDialog implements OnInit {
  private rolApi = inject(RolApiService);
  private permisoApi = inject(PermisoApiService);
  private snack = inject(MatSnackBar);
  protected data = inject<{ rolId: number; nombreRol: string }>(MAT_DIALOG_DATA);
  protected ref = inject(MatDialogRef<RolPermisosDialog>);

  protected loading = signal(true);
  protected saving = signal(false);
  protected permisos = signal<Permiso[]>([]);
  protected seleccionados = new Set<number>();

  ngOnInit(): void {
    forkJoin({
      activos: this.permisoApi.listarActivos(),
      rolConPermisos: this.rolApi.buscarConPermisos(this.data.rolId),
    }).subscribe({
      next: ({ activos, rolConPermisos }) => {
        this.permisos.set(activos);
        (rolConPermisos.permisos || []).forEach((p) => this.seleccionados.add(p.id));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snack.open('No se pudieron cargar los permisos', 'Cerrar', { duration: 3000, panelClass: ['snack-error'] });
        this.ref.close();
      },
    });
  }

  toggle(id: number, checked: boolean): void {
    if (checked) this.seleccionados.add(id);
    else this.seleccionados.delete(id);
  }

  guardar(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.rolApi.asignarPermisos(this.data.rolId, { permisoIds: Array.from(this.seleccionados) }).subscribe({
      next: () => {
        this.saving.set(false);
        this.snack.open('Permisos actualizados', 'OK', { duration: 2000, panelClass: ['snack-success'] });
        this.ref.close(true);
      },
      error: () => {
        this.saving.set(false);
        this.snack.open('No se pudieron guardar los permisos. Inténtalo de nuevo.', 'Cerrar', { duration: 3000, panelClass: ['snack-error'] });
      },
    });
  }
}
