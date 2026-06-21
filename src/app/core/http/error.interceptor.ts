import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ApiError } from '../models/api-error.model';

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
