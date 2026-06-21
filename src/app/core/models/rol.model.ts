import { Permiso } from './permiso.model';

export interface Rol {
  id: number;
  nombre: string;
  activo: boolean;
  permisos?: Permiso[];
}

export interface AsignarPermisosRequest {
  permisoIds: number[];
}
