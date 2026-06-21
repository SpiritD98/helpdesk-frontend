import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, EmpresaRequest, EmpresaTickets } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/empresas`;

  listarTodas(ruc?: string): Observable<Empresa[]> {
    let params = new HttpParams();
    if (ruc) params = params.set('ruc', ruc);
    return this.http.get<Empresa[]>(this.url, { params });
  }
  buscarPorId(id: number): Observable<Empresa> { return this.http.get<Empresa>(`${this.url}/${id}`); }
  buscarPorNombre(texto: string): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.url}/buscar`, { params: new HttpParams().set('texto', texto) });
  }
  recientes(dias = 30): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(`${this.url}/recientes`, { params: new HttpParams().set('dias', String(dias)) });
  }
  ranking(): Observable<EmpresaTickets[]> { return this.http.get<EmpresaTickets[]>(`${this.url}/ranking`); }

  guardar(payload: EmpresaRequest): Observable<Empresa> { return this.http.post<Empresa>(this.url, payload); }
  actualizar(id: number, payload: EmpresaRequest): Observable<Empresa> { return this.http.put<Empresa>(`${this.url}/${id}`, payload); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }
}
