import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Comentario, ComentarioRequest } from '../models/comentario.model';

@Injectable({ providedIn: 'root' })
export class ComentarioApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/comentarios`;

  agregar(payload: ComentarioRequest): Observable<Comentario> {
    return this.http.post<Comentario>(this.url, payload);
  }
  listarPorTicket(ticketId: number): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.url}/ticket/${ticketId}`);
  }
  listarPorUsuario(usuarioId: number): Observable<Comentario[]> { return this.http.get<Comentario[]>(`${this.url}/usuario/${usuarioId}`); }
  buscarPorTexto(texto: string): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.url}/buscar`, { params: new HttpParams().set('texto', texto) });
  }
  rankingUsuarios(empresaId?: number): Observable<{ usuario: string; total: number }[]> {
    let params = new HttpParams();
    if (empresaId) params = params.set('empresaId', String(empresaId));
    return this.http.get<{ usuario: string; total: number }[]>(`${this.url}/ranking-usuarios`, { params });
  }
  recientes(empresaId: number, dias = 7): Observable<Comentario[]> {
    return this.http.get<Comentario[]>(`${this.url}/empresa/${empresaId}/recientes`, { params: new HttpParams().set('dias', String(dias)) });
  }
}
