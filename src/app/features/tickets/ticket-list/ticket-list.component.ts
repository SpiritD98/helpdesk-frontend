import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TicketApiService } from '../../../core/services/ticket-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Ticket } from '../../../core/models/ticket.model';
import { EstadoTicket, EstadoTicketLabel, PrioridadTicketLabel } from '../../../core/models/enums';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatTableModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatIconModule,
    MatButtonModule, MatButtonToggleModule, MatProgressSpinnerModule,
    MatDialogModule, MatTooltipModule,
  ],
  template: `
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Tickets</h1>
    </div>

    <mat-card>
      <mat-card-content>
        <div class="flex flex-wrap gap-3 items-center mb-4">
          @if (rol() !== 'CLIENTE') {
            <mat-form-field appearance="outline" class="!w-64">
              <mat-label>Buscar</mat-label>
              <input matInput [(ngModel)]="filtro" (ngModelChange)="aplicarFiltro()" placeholder="Código, título..." />
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline" class="!w-48">
              <mat-label>Estado</mat-label>
              <mat-select [ngModel]="estadoFiltro()" (ngModelChange)="onEstadoChange($event)">
                @for (op of opcionesEstado(); track op.value) {
                  <mat-option [value]="op.value">{{ op.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }

          @if (rol() !== 'AGENTE' && rol() !== 'CLIENTE') {
            <mat-button-toggle-group
              [value]="agenteFiltro()"
              (change)="cambiarFiltroAgente($event.value)"
              class="!h-14"
              aria-label="Filtro por agente">
              <mat-button-toggle [value]="null" matTooltip="Todos los tickets">Todos</mat-button-toggle>
              <mat-button-toggle [value]="true" matTooltip="Solo tickets con agente asignado">
                <mat-icon class="!mr-1" style="font-size:18px">person</mat-icon> Con agente
              </mat-button-toggle>
              <mat-button-toggle [value]="false" matTooltip="Solo tickets sin agente asignado">
                <mat-icon class="!mr-1" style="font-size:18px">person_off</mat-icon> Sin agente
              </mat-button-toggle>
            </mat-button-toggle-group>
          }

          @if (rol() === 'CLIENTE') {
            <button mat-flat-button color="primary" (click)="nuevo()" class="ml-auto">
              <mat-icon>add_circle_outline</mat-icon> Reportar un problema
            </button>
          }
        </div>

        @if (loading()) {
          <div class="flex justify-center py-8"><mat-spinner></mat-spinner></div>
        }
        <div [hidden]="loading()">
          <table mat-table [dataSource]="ds" class="w-full">
            <ng-container matColumnDef="codigo">
              <th mat-header-cell *matHeaderCellDef>Código</th>
              <td mat-cell *matCellDef="let t" class="font-mono text-sm">{{ t.codigo }}</td>
            </ng-container>
            <ng-container matColumnDef="titulo">
              <th mat-header-cell *matHeaderCellDef>Título</th>
              <td mat-cell *matCellDef="let t">{{ t.titulo }}</td>
            </ng-container>
            <ng-container matColumnDef="estado">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let t">
                <span class="badge" [ngClass]="'badge-' + t.estado.toLowerCase().replace('_','')">
                  {{ getEstadoLabel(t.estado) }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="prioridad">
              <th mat-header-cell *matHeaderCellDef>Prioridad</th>
              <td mat-cell *matCellDef="let t">
                <span class="badge" [ngClass]="'badge-' + t.prioridad.toLowerCase()">
                  {{ getPrioridadLabel(t.prioridad) }}
                </span>
              </td>
            </ng-container>
            <ng-container matColumnDef="agente">
              <th mat-header-cell *matHeaderCellDef>Agente</th>
              <td mat-cell *matCellDef="let t">
                @if (t.agenteAsignado) {
                  <span class="badge badge-resuelto" matTooltip="Agente asignado">
                    <mat-icon class="!mr-1" style="font-size:14px;width:14px;height:14px">check_circle</mat-icon>
                    {{ t.agenteAsignado.nombres.split(' ')[0] }}
                  </span>
                } @else {
                  <span class="badge badge-cerrado" matTooltip="Sin agente asignado">
                    <mat-icon class="!mr-1" style="font-size:14px;width:14px;height:14px">person_off</mat-icon>
                    Sin agente
                  </span>
                }
              </td>
            </ng-container>
            <ng-container matColumnDef="fecha">
              <th mat-header-cell *matHeaderCellDef>Fecha</th>
              <td mat-cell *matCellDef="let t" class="text-sm">{{ t.fechaCreacion | date:'short' }}</td>
            </ng-container>
            <ng-container matColumnDef="acciones">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let t">
                <button mat-icon-button (click)="ver(t)" matTooltip="Ver detalle"><mat-icon>visibility</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let row; columns: cols;"></tr>
          </table>
          <!-- Paginación manual -->
          <div class="flex items-center justify-between mt-4 px-2">
            <div class="flex items-center gap-2 text-sm text-gray-600">
              <span>Items por página:</span>
              <mat-select [ngModel]="limit()" (ngModelChange)="cambiarLimit($event)" class="!w-16" subscriptSizing="dynamic">
                @for (opt of limitOptions; track opt) {
                  <mat-option [value]="opt">{{ opt }}</mat-option>
                }
              </mat-select>
            </div>
            <div class="flex items-center gap-1">
              <button mat-icon-button [disabled]="page() === 1" (click)="irPrimeraPagina()">
                <mat-icon>first_page</mat-icon>
              </button>
              <button mat-icon-button [disabled]="page() === 1" (click)="irPaginaAnterior()">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="text-sm text-gray-600 mx-2">
                Pág. {{ page() }} de {{ totalPages() }}
              </span>
              <button mat-icon-button [disabled]="page() === totalPages()" (click)="irPaginaSiguiente()">
                <mat-icon>chevron_right</mat-icon>
              </button>
              <button mat-icon-button [disabled]="page() === totalPages()" (click)="irUltimaPagina()">
                <mat-icon>last_page</mat-icon>
              </button>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
})
export class TicketListComponent implements OnInit {
  private api = inject(TicketApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  protected loading = signal(true);
  protected filtro = '';
  protected estadoFiltro = signal<EstadoTicket | null>(null);
  protected agenteFiltro = signal<boolean | null>(null);
  protected cols = ['codigo', 'titulo', 'estado', 'prioridad', 'agente', 'fecha', 'acciones'];

  protected rol = computed(() => this.auth.user()?.rol ?? null);

  protected opcionesEstadoAdmin = [
    { label: 'Todos', value: null },
    { label: 'Abierto', value: 'ABIERTO' as EstadoTicket },
    { label: 'En progreso', value: 'EN_PROGRESO' as EstadoTicket },
    { label: 'Resuelto', value: 'RESUELTO' as EstadoTicket },
    { label: 'Cerrado', value: 'CERRADO' as EstadoTicket },
  ];

  protected opcionesEstadoAgente = [
    { label: 'Todos', value: null },
    { label: 'En progreso', value: 'EN_PROGRESO' as EstadoTicket },
    { label: 'Resueltos', value: 'RESUELTO' as EstadoTicket },
  ];

  protected opcionesEstado = computed(() =>
    this.rol() === 'AGENTE' ? this.opcionesEstadoAgente : this.opcionesEstadoAdmin
  );

  // Paginación manual
  protected page = signal(1);
  protected limit = signal(5);
  protected limitOptions = [5, 10, 15, 20];

  protected totalPages = computed(() => Math.ceil(this.filteredCount() / this.limit()) || 1);

  private filteredCount = signal(0);

  private allTickets = signal<Ticket[]>([]);

  ds = new MatTableDataSource<Ticket>([]);

  constructor() {
    effect(() => {
      const tickets = this.allTickets();
      const estado = this.estadoFiltro();
      const agente = this.agenteFiltro();
      const p = this.page();
      const l = this.limit();

      let filtered = estado === null
        ? tickets
        : tickets.filter(t => t.estado === estado);

      if (agente !== null) {
        filtered = filtered.filter(t =>
          agente ? t.agenteAsignado != null : t.agenteAsignado == null
        );
      }

      this.filteredCount.set(filtered.length);
      const start = (p - 1) * l;
      this.ds.data = filtered.slice(start, start + l);
    });
  }

  ngOnInit(): void { this.cargar(); }

  irPrimeraPagina(): void { this.page.set(1); }
  irPaginaAnterior(): void { if (this.page() > 1) this.page.set(this.page() - 1); }
  irPaginaSiguiente(): void { if (this.page() < this.totalPages()) this.page.set(this.page() + 1); }
  irUltimaPagina(): void { this.page.set(this.totalPages()); }
  cambiarLimit(nuevoLimit: number): void { this.limit.set(nuevoLimit); this.page.set(1); }

  cargar(): void {
    const rol = this.auth.user()?.rol;
    const eid = this.auth.getEmpresaId();
    const uid = this.auth.getUserId();

    this.loading.set(true);
    let obs: Observable<Ticket[]> | null = null;

    if (rol === 'ADMIN_OWNER') {
      obs = this.api.listarTodos();
    } else if (rol === 'ADMIN_EMPRESA' && eid) {
      obs = this.api.listarPorEmpresa(eid);
    } else if (rol === 'AGENTE' && uid) {
      obs = this.api.listarPorAgente(uid);
    } else if (rol === 'CLIENTE' && uid) {
      obs = this.api.listarPorCliente(uid);
    } else {
      this.loading.set(false);
      return;
    }

    obs.subscribe({
      next: (data) => { this.allTickets.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  cambiarFiltroAgente(value: boolean | null): void {
    this.agenteFiltro.set(value);
    this.page.set(1);
  }

  protected onEstadoChange(value: EstadoTicket | null): void {
    this.estadoFiltro.set(value);
    this.page.set(1);
  }

  aplicarFiltro(): void {
    this.ds.filter = this.filtro.trim().toLowerCase();
  }

  nuevo(): void { this.router.navigate(['/tickets/nuevo']); }
  ver(t: Ticket): void { this.router.navigate(['/tickets', t.id]); }

  getEstadoLabel(e: string): string { return (EstadoTicketLabel as Record<string, string>)[e] || e; }
  getPrioridadLabel(p: string): string { return (PrioridadTicketLabel as Record<string, string>)[p] || p; }
}
