import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardResponse, TicketsPorMes, UsuariosActivos } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class ReporteApiService {
  private http = inject(HttpClient);
  private url = `${environment.apiBaseUrl}/reportes`;

  dashboard(empresaId: number, anio: number): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.url}/dashboard`, {
      params: new HttpParams().set('empresaId', String(empresaId)).set('anio', String(anio)),
    });
  }
  dashboardGlobal(anio: number): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.url}/dashboard/todas`, {
      params: new HttpParams().set('anio', String(anio)),
    });
  }
  ticketsPorMes(empresaId: number, anio: number, mes?: number): Observable<TicketsPorMes[]> {
    let params = new HttpParams().set('empresaId', String(empresaId)).set('anio', String(anio));
    if (mes) params = params.set('mes', String(mes));
    return this.http.get<TicketsPorMes[]>(`${this.url}/tickets-mes`, { params });
  }
  ticketsPorMesGlobal(anio: number, mes?: number): Observable<TicketsPorMes[]> {
    let params = new HttpParams().set('anio', String(anio));
    if (mes) params = params.set('mes', String(mes));
    return this.http.get<TicketsPorMes[]>(`${this.url}/tickets-mes/todas`, { params });
  }
  usuariosActivos(empresaId: number): Observable<UsuariosActivos> {
    return this.http.get<UsuariosActivos>(`${this.url}/usuarios-activos`, {
      params: new HttpParams().set('empresaId', String(empresaId)),
    });
  }
  usuariosActivosGlobal(): Observable<UsuariosActivos> {
    return this.http.get<UsuariosActivos>(`${this.url}/usuarios-activos/todas`);
  }
}
