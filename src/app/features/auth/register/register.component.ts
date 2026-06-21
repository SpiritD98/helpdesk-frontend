import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 px-4 py-8">
      <mat-card class="w-full max-w-md">
        <mat-card-header class="flex flex-col items-center pb-4">
          <mat-icon class="text-5xl text-primary-600 !w-14 !h-14">person_add</mat-icon>
          <mat-card-title class="!text-2xl !font-bold !mt-2">Crear cuenta</mat-card-title>
          <mat-card-subtitle>Registro de Cliente</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-3">
            <div class="grid grid-cols-2 gap-2">
              <mat-form-field appearance="outline">
                <mat-label>Nombres</mat-label>
                <input matInput formControlName="nombres" />
                @if (form.controls.nombres.hasError('required') && form.controls.nombres.touched) {
                  <mat-error>Obligatorio</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Apellidos</mat-label>
                <input matInput formControlName="apellidos" />
                @if (form.controls.apellidos.hasError('required') && form.controls.apellidos.touched) {
                  <mat-error>Obligatorio</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (form.controls.email.hasError('email')) { <mat-error>Email inválido</mat-error> }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input matInput type="password" formControlName="password" />
              @if (form.controls.password.hasError('minlength')) {
                <mat-error>Mínimo 6 caracteres</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput formControlName="telefono" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>ID Empresa</mat-label>
              <input matInput type="number" formControlName="empresaId" />
              @if (form.controls.empresaId.hasError('required') && form.controls.empresaId.touched) {
                <mat-error>Obligatorio</mat-error>
              }
            </mat-form-field>

            <button mat-flat-button color="primary" type="submit" [disabled]="loading() || form.invalid">
              @if (loading()) { <mat-spinner diameter="20" class="mr-2 inline-block"></mat-spinner> }
              Registrarme
            </button>
            <div class="text-center text-sm text-gray-600 mt-2">
              ¿Ya tienes cuenta? <a routerLink="/login" class="text-primary-600 hover:underline">Inicia sesión</a>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  protected loading = signal(false);

  form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: [''],
    empresaId: [0, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'No se pudo registrar';
        this.snack.open(msg, 'Cerrar', { duration: 4000, panelClass: ['snack-error'] });
      },
    });
  }
}
