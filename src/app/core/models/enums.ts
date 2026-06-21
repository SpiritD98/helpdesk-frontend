export enum EstadoTicket {
  ABIERTO = 'ABIERTO',
  EN_PROGRESO = 'EN_PROGRESO',
  RESUELTO = 'RESUELTO',
  CERRADO = 'CERRADO',
}

export enum PrioridadTicket {
  BAJA = 'BAJA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export const EstadoTicketLabel: Record<EstadoTicket, string> = {
  [EstadoTicket.ABIERTO]: 'Abierto',
  [EstadoTicket.EN_PROGRESO]: 'En progreso',
  [EstadoTicket.RESUELTO]: 'Resuelto',
  [EstadoTicket.CERRADO]: 'Cerrado',
};

export const PrioridadTicketLabel: Record<PrioridadTicket, string> = {
  [PrioridadTicket.BAJA]: 'Baja',
  [PrioridadTicket.MEDIA]: 'Media',
  [PrioridadTicket.ALTA]: 'Alta',
  [PrioridadTicket.CRITICA]: 'Crítica',
};
