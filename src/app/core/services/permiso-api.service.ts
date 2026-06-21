import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permiso } from '../models/permiso.model';

@Injectable({ providedIn: 'root' })
export class PermisoApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/permisos`;

  listarTodos(): Observable<Permiso[]> { return this.http.get<Permiso[]>(this.url); }
  listarActivos(): Observable<Permiso[]> { return this.http.get<Permiso[]>(`${this.url}/activos`); }
  buscarPorId(id: number): Observable<Permiso> { return this.http.get<Permiso>(`${this.url}/${id}`); }
  buscarPorTexto(texto: string): Observable<Permiso[]> {
    return this.http.get<Permiso[]>(`${this.url}/buscar`, { params: new HttpParams().set('texto', texto) });
  }
  guardar(payload: Permiso): Observable<Permiso> { return this.http.post<Permiso>(this.url, payload); }
  actualizar(id: number, payload: Permiso): Observable<Permiso> { return this.http.put<Permiso>(`${this.url}/${id}`, payload); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
