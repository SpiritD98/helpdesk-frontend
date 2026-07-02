import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// El guard de roles se encarga de proteger las rutas que requieren que el usuario tenga ciertos roles para acceder a ellas.
export const roleGuard = (allowed: string[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Se verifica si el usuario está autenticado; si no lo está, se redirige a la página de inicio de sesión.
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  // Si el usuario tiene el rol permitido, se permite el acceso a la ruta; de lo contrario, se redirige a la página de acceso denegado.
  if (auth.hasRole(allowed)) return true;
  router.navigate(['/forbidden']);
  return false;
};
