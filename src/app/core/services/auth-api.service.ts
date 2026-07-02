import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

// El servicio AuthApiService se encarga de realizar las solicitudes HTTP relacionadas con la autenticación,
// como el inicio de sesión, el registro y el cierre de sesión. Utiliza HttpClient para enviar las solicitudes al backend 
// y devuelve observables que contienen las respuestas del servidor.
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/auth`;
  // El método login envía una solicitud POST al endpoint de inicio de sesión del backend con los datos del usuario 
  // (correo electrónico y contraseña) y devuelve un observable que emite la respuesta de autenticación.
  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/login`, payload);
  }
    // El método register envía una solicitud POST al endpoint de registro del backend con los datos del nuevo usuario 
    // y devuelve un observable que emite la respuesta de autenticación.
  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.url}/register`, payload);
  }
  // El método logout envía una solicitud POST al endpoint de cierre de sesión del backend y devuelve un observable que 
  // emite un mensaje de confirmación.
  logout(): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.url}/logout`, {});
  }
}
