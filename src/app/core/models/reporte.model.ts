export interface TicketsPorMes {
  mes: number;
  total: number;
}

export interface UsuariosActivos {
  empresaId: number;
  usuariosActivos: number;
}

export interface DashboardResponse {
  empresaId: number;
  anio: number;
  ticketsPorEstado: Record<string, number>;
  ticketsPorMes: TicketsPorMes[];
  usuariosActivos: number;
  totalUsuarios: number;
}

export interface ConteoCategoria {
  categoria: string;
  total: number;
}

export interface RankingUsuario {
  usuario: string;
  total: number;
}
