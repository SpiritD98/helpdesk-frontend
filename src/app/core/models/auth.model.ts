export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  empresaId: number;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  email: string;
  nombres: string;
  apellidos: string;
  rol: string;
  empresaId: number;
  nombreEmpresa: string;
  usuarioId: number;
}
