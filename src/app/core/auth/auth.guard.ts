import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

// El guard de autenticación se encarga de proteger las rutas que requieren que el usuario esté autenticado.
// Si el usuario no está autenticado, se redirige a la página de inicio de sesión.
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
