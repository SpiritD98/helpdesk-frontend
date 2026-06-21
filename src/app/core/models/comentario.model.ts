export interface Comentario {
  id: number;
  mensaje: string;
  fechaEnvio: string;
  ticketId: number;
  usuarioId: number;
  usuarioNombre?: string;
  esSistema?: boolean;
}

export interface ComentarioRequest {
  mensaje: string;
  ticketId: number;
}
