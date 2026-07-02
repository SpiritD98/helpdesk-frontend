import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { AuthApiService } from '../services/auth-api.service';

// El servicio AuthService se encarga de gestionar la autenticación del 
// usuario en la aplicación, incluyendo el inicio de sesión, el registro, el cierre de sesión y la verificación de roles.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'helpdesk_auth';
  private readonly TS_KEY = 'helpdesk_auth_ts';

  private api = inject(AuthApiService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  // La propiedad state es una señal que almacena la información de autenticación del usuario, 
  // incluyendo el token, la fecha de expiración y los datos del usuario.
  // Si esta es nula, cualquier componente de la interfaz de usuario que dependa 
  // de la autenticación se actualizará automáticamente sin tener que recargar la página.
  private state = signal<AuthResponse | null>(this.loadFromSession());

  user = computed(() => this.state());
  isAuthenticated = computed(() => {
    const r = this.state();
    if (!r) return false;
    return !this.isExpired();
  });

  private expiryTimerId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (this.isExpired()) this.logout();
  }

  // Inicia sesión con el correo electrónico y la contraseña proporcionados,
  login(email: string, password: string): Observable<AuthResponse> {
    const req: LoginRequest = { email, password };
    return this.api.login(req).pipe(
      tap((res) => {
        this.persist(res);
        this.scheduleExpiry(res.expiresIn * 1000);
      })
    );
  }

  // Registra un nuevo usuario con los datos proporcionados, incluyendo nombres, 
  // apellidos, correo electrónico, contraseña y empresaId.
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.api.register(payload).pipe(
      tap((res) => {
        this.persist(res);
        this.scheduleExpiry(res.expiresIn * 1000);
      })
    );
  }

  // Cierra la sesión del usuario, eliminando la información de autenticación del almacenamiento de sesión y 
  // redirigiendo al usuario a la página de inicio de sesión.
  logout(): void {
    if (this.expiryTimerId) {
      clearTimeout(this.expiryTimerId);
      this.expiryTimerId = null;
    }
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TS_KEY);
    this.state.set(null);
    this.router.navigate(['/login']);
  }

  // Fuerza el cierre de sesión del usuario cuando la sesión ha expirado, mostrando un mensaje de error y 
  // redirigiendo al usuario a la página de inicio de sesión.
  forceLogoutExpired(): void {
    this.snack.open('Tu sesión expiró. Ingresa nuevamente.', 'OK', {
      duration: 4000,
      // El panelClass se utiliza para aplicar estilos personalizados al mensaje de error que se muestra cuando 
      // la sesión del usuario ha expirado. En este caso, se aplica la clase 'snack-error' para indicar visualmente 
      // que se trata de un error de sesión.
      panelClass: ['snack-error'],
    });
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.TS_KEY);
    this.state.set(null);
    this.router.navigate(['/login']);
  }

  // Verifica si el usuario tiene alguno de los roles permitidos, devolviendo true si el rol del usuario está 
  // incluido en la lista de roles permitidos.
  hasRole(roles: string[]): boolean {
    const r = this.state()?.rol;
    return r ? roles.includes(r) : false;
  }

  getToken(): string | null { return this.state()?.token ?? null; }
  getRol(): string | null { return this.state()?.rol ?? null; }
  getEmpresaId(): number | null { return this.state()?.empresaId ?? null; }
  getUserId(): number | null { return this.state()?.usuarioId ?? null; }
  getFullName(): string {
    const r = this.state();
    return r ? `${r.nombres} ${r.apellidos}`.trim() : '';
  }

  // Persiste la información de autenticación en el almacenamiento de sesión (sessionStorage) y 
  // actualiza la señal state con los datos del usuario.
  private persist(res: AuthResponse): void {
    // El backend envía expiresIn en segundos (convención JWT/OAuth).
    const normalized: AuthResponse = { ...res, expiresIn: res.expiresIn * 1000 };
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
    sessionStorage.setItem(this.TS_KEY, String(Date.now()));
    this.state.set(normalized);
  }

  // Carga la información de autenticación desde el almacenamiento de sesión (sessionStorage) y la devuelve
  // como un objeto AuthResponse.
  private loadFromSession(): AuthResponse | null {
    try {
      const s = sessionStorage.getItem(this.STORAGE_KEY);
      if (!s) return null;
      const parsed = JSON.parse(s) as AuthResponse;
      // Sesiones guardadas antes del fix usaban segundos como milisegundos.
      if (parsed.expiresIn > 0 && parsed.expiresIn < 1_000_000) {
        parsed.expiresIn *= 1000;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private isExpired(): boolean {
    const ts = sessionStorage.getItem(this.TS_KEY);
    const r = this.state();
    if (!r || !ts) return false;
    return Date.now() >= Number(ts) + r.expiresIn;
  }

  // Programa un temporizador para forzar el cierre de sesión del usuario cuando la sesión haya expirado.
  private scheduleExpiry(ms: number): void {
    if (this.expiryTimerId) clearTimeout(this.expiryTimerId);
    this.expiryTimerId = setTimeout(() => this.forceLogoutExpired(), ms);
  }
}
