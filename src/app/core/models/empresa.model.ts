export interface Empresa {
  id: number;
  nombre: string;
  ruc: string;
  correoContacto: string;
  telefonoContacto: string;
  activo: boolean;
  fechaCreacion?: string;
}

export interface EmpresaRequest {
  ruc: string;
  nombre: string;
  telefonoContacto: string;
  correoContacto: string;
}

export interface EmpresaTickets {
  empresa: string;
  cantidadTickets: number;
}
