import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/auth/auth.service';
import { SidebarComponent } from '../sidebar/sidebar.component';

// Este componente es el shell principal de la aplicación, que contiene la barra de herramientas y el menú lateral. 
// Se utiliza para envolver el contenido de las páginas y proporcionar una estructura consistente en toda la aplicación.
@Component({
  // Definimos la etiqueta HTML que representará este componente en la aplicación.
  selector: 'app-shell',
  // Indica que este componente es independiente y no depende de un módulo específico.
  standalone: true,
  // Se establece la estrategia de detección de cambios en OnPush para mejorar el rendimiento.
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    SidebarComponent,
  ],
  // template define la estructura HTML del componente, incluyendo el sidebar y el contenido principal.
  template: `
    <!-- Sidebar flotante fijo a la izquierda -->
    <app-sidebar (collapsedChange)="onSidebarToggle($event)"></app-sidebar>

    <!-- Contenido principal desplazado para no tapar el sidebar -->
    <div
      class="transition-all duration-300 ease-in-out min-h-screen bg-gray-50"
      [style.margin-left]="sidebarCollapsed() ? '64px' : '260px'"
    >
      <!-- Toolbar (pide width: 100% del viewport ahora sí) -->
      <mat-toolbar color="primary" class="flex justify-between items-center">
        <span class="font-semibold">Mesa de Ayuda - {{ auth.user()?.nombreEmpresa }}</span>
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          <span class="ml-2">{{ auth.getFullName() }}</span>
          <span class="ml-2 text-xs opacity-80">({{ auth.user()?.rol }})</span>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item disabled>{{ auth.user()?.email }}</button>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar sesión</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <!-- Page content -->
      <main class="p-6">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})

// Clase del componente ShellComponent que maneja la lógica del shell principal de la aplicación.
export class ShellComponent {
  protected auth = inject(AuthService);
  sidebarCollapsed = signal(false);

  onSidebarToggle(isCollapsed: boolean): void {
    this.sidebarCollapsed.set(isCollapsed);
  }
}
