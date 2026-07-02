import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../models/api-error.model';

// El interceptor de errores se encarga de manejar los errores HTTP que ocurren durante las solicitudes realizadas por la aplicación.
// Cuando se produce un error, el interceptor verifica el código de estado HTTP y realiza acciones específicas según el tipo de error.
// Por ejemplo, si se recibe un error 401 (no autorizado) y la solicitud no es para los endpoints de autenticación, se fuerza el cierre 
// de sesión del usuario.
// Además, se muestra un mensaje de error al usuario utilizando MatSnackBar, con diferentes estilos según el tipo de error.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && !isAuthEndpoint) {
        auth.forceLogoutExpired();
        return throwError(() => err);
      }
      const body = err.error as ApiError | null;
      const msg = body?.message || err.message || 'Error de comunicación con el servidor';
      const css =
        err.status === 0
          ? 'snack-error'
          : err.status >= 500
            ? 'snack-error'
            : err.status === 403
              ? 'snack-info'
              : 'snack-error';
      if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
        snack.open(msg, 'Cerrar', { duration: 4000, panelClass: [css] });
      }
      return throwError(() => err);
    })
  );
};
