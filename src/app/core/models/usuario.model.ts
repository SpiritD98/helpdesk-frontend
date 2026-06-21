export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  activo: boolean;
  fechaCreacion?: string;
  empresa?: { id: number; nombre: string };
  rol?: { id: number; nombre: string };
}

export interface UsuarioRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  rolId: number;
}

export interface UsuarioRolCount {
  rol: string;
  cantidad: number;
}
