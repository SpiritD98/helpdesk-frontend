import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { PublicApiService } from '../../../core/services/public-api.service';
import { Empresa } from '../../../core/models/empresa.model';

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
    MatSelectModule,
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
                <input matInput formControlName="nombres" (keydown)="soloTexto($event)" />
                @if (form.controls.nombres.hasError('required') && form.controls.nombres.touched) {
                  <mat-error>Obligatorio</mat-error>
                } @else if (form.controls.nombres.hasError('pattern')) {
                  <mat-error>Solo letras y espacios</mat-error>
                }
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Apellidos</mat-label>
                <input matInput formControlName="apellidos" (keydown)="soloTexto($event)" />
                @if (form.controls.apellidos.hasError('required') && form.controls.apellidos.touched) {
                  <mat-error>Obligatorio</mat-error>
                } @else if (form.controls.apellidos.hasError('pattern')) {
                  <mat-error>Solo letras y espacios</mat-error>
                }
              </mat-form-field>
            </div>
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (form.controls.email.hasError('required') && form.controls.email.touched) {
                <mat-error>El email es obligatorio</mat-error>
              } @else if (form.controls.email.hasError('email')) {
                <mat-error>Email inválido</mat-error>
              }
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
              <input matInput formControlName="telefono" maxlength="9" (keydown)="soloNumeros($event)" placeholder="999888777" />
              @if (form.controls.telefono.hasError('pattern') && form.controls.telefono.touched) {
                <mat-error>Debe tener 9 dígitos</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Empresa</mat-label>
              <mat-select formControlName="empresaId">
                @for (e of empresas(); track e.id) {
                  <mat-option [value]="e.id">{{ e.nombre }}</mat-option>
                }
              </mat-select>
              @if (form.controls.empresaId.hasError('required') && form.controls.empresaId.touched) {
                <mat-error>Selecciona una empresa</mat-error>
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
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private publicApi = inject(PublicApiService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  protected loading = signal(false);
  protected empresas = signal<Empresa[]>([]);

  form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    apellidos: ['', [Validators.required, Validators.maxLength(100), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    telefono: ['', [Validators.pattern('^[0-9]{9}$')]],
    empresaId: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.publicApi.listarEmpresas().subscribe({
      next: (empresas) => this.empresas.set(empresas),
      error: () => this.empresas.set([]),
    });
  }

  /** Permite solo números y teclas de edición en el teléfono. */
  soloNumeros(event: KeyboardEvent): void {
    const allowed = ['0','1','2','3','4','5','6','7','8','9','Backspace','Delete','ArrowLeft','ArrowRight','Tab'];
    if (!allowed.includes(event.key)) event.preventDefault();
  }

  /** Bloquea números/símbolos en nombres y apellidos (solo letras y espacios). */
  soloTexto(event: KeyboardEvent): void {
    const permitido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key);
    const control = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(event.key);
    if (!permitido && !control) event.preventDefault();
  }

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
