import { Component, ChangeDetectionStrategy, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { PermisoApiService } from '../../../core/services/permiso-api.service';
import { Permiso } from '../../../core/models/permiso.model';

@Component({
  selector: 'app-permiso-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  template: `
    <h1 class="text-2xl font-bold mb-4">Permisos</h1>
    <mat-card>
      <mat-card-content>
        @if (loading()) {
          <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div>
        } @else {
          <table mat-table [dataSource]="ds" class="w-full">
            <ng-container matColumnDef="nombre">
              <th mat-header-cell *matHeaderCellDef>Nombre</th>
              <td mat-cell *matCellDef="let p" class="font-mono text-sm">{{ p.nombre }}</td>
            </ng-container>
            <ng-container matColumnDef="descripcion">
              <th mat-header-cell *matHeaderCellDef>Descripción</th>
              <td mat-cell *matCellDef="let p">{{ p.descripcion }}</td>
            </ng-container>
            <ng-container matColumnDef="activo">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let p">
                <span class="badge" [ngClass]="p.activo ? 'badge-resuelto' : 'badge-cerrado'">
                  {{ p.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let p">
                @if (p.activo) {
                  <button mat-icon-button color="warn" (click)="toggleEstado(p)" matTooltip="Desactivar permiso">
                    <mat-icon>block</mat-icon>
                  </button>
                } @else {
                  <button mat-icon-button color="primary" (click)="toggleEstado(p)" matTooltip="Activar permiso">
                    <mat-icon>check_circle</mat-icon>
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          <mat-paginator [pageSizeOptions]="[5, 10, 25]" pageSize="10"></mat-paginator>
        }
      </mat-card-content>
    </mat-card>
  `,
})
export class PermisoListComponent implements OnInit, AfterViewInit {
  private api = inject(PermisoApiService);
  private snack = inject(MatSnackBar);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  protected loading = signal(true);
  protected cols = ['nombre', 'descripcion', 'activo', 'acciones'];
  ds = new MatTableDataSource<Permiso>([]);

  ngOnInit(): void {
    this.api.listarTodos().subscribe({
      next: (ps) => { this.ds.data = ps; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
  ngAfterViewInit(): void { this.ds.paginator = this.paginator; }

  toggleEstado(p: Permiso): void {
    // El backend implementa borrado lógico (desactiva, no elimina).
    // Desactivar -> DELETE; reactivar -> PUT con activo=true.
    const nuevoEstado = !p.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!confirm(`¿${nuevoEstado ? 'Activar' : 'Desactivar'} el permiso '${p.nombre}'?`)) return;

    const req$: Observable<unknown> = nuevoEstado
      ? this.api.actualizar(p.id, { ...p, activo: true })
      : this.api.eliminar(p.id);

    req$.subscribe({
      next: () => {
        this.ds.data = this.ds.data.map((x) =>
          x.id === p.id ? { ...x, activo: nuevoEstado } : x,
        );
        this.snack.open(`Permiso ${nuevoEstado ? 'activado' : 'desactivado'}`, 'OK', {
          duration: 2000,
          panelClass: ['snack-success'],
        });
      },
      error: (err: HttpErrorResponse) => {
        if (!nuevoEstado && err.status === 409) {
          this.snack.open('No se puede desactivar: está asignado a uno o más roles.', 'Cerrar', {
            duration: 4000,
            panelClass: ['snack-error'],
          });
        } else {
          this.snack.open(`No se pudo ${accion} el permiso.`, 'Cerrar', {
            duration: 3000,
            panelClass: ['snack-error'],
          });
        }
      },
    });
  }
}
