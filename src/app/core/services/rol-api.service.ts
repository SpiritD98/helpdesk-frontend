import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AsignarPermisosRequest, Rol } from '../models/rol.model';

@Injectable({ providedIn: 'root' })
export class RolApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/roles`;

  listarTodos(): Observable<Rol[]> { return this.http.get<Rol[]>(this.url); }
  buscarPorId(id: number): Observable<Rol> { return this.http.get<Rol>(`${this.url}/${id}`); }
  buscarPorNombre(nombre: string): Observable<Rol> { return this.http.get<Rol>(`${this.url}/nombre/${nombre}`); }
  buscarConPermisos(id: number): Observable<Rol> { return this.http.get<Rol>(`${this.url}/${id}/permisos`); }
  guardar(payload: Rol): Observable<Rol> { return this.http.post<Rol>(this.url, payload); }
  actualizar(id: number, payload: Rol): Observable<Rol> { return this.http.put<Rol>(`${this.url}/${id}`, payload); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
  asignarPermisos(id: number, payload: AsignarPermisosRequest): Observable<Rol> {
    return this.http.put<Rol>(`${this.url}/${id}/permisos`, payload);
  }
}
