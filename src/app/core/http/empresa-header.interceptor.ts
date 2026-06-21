import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor deshabilitado.
 * El tenant (empresaId / usuarioId) se obtiene en el backend a partir del JWT,
 * no de headers que el cliente puede manipular. Se conserva el export para no
 * romper referencias históricas, pero ya no añade ningún header.
 */
export const empresaHeaderInterceptor: HttpInterceptorFn = (req, next) => next(req);
