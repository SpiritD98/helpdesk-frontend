import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col items-center justify-center h-screen bg-gray-100">
      <mat-icon class="text-7xl text-red-500">block</mat-icon>
      <h1 class="text-3xl font-bold mt-4">403 - Acceso Denegado</h1>
      <p class="text-gray-600 mt-2">No tienes permisos para acceder a esta sección.</p>
      <a mat-flat-button color="primary" routerLink="/dashboard" class="mt-6">
        <mat-icon>home</mat-icon>
        Volver al Dashboard
      </a>
    </div>
  `,
})
export class ForbiddenComponent {}
