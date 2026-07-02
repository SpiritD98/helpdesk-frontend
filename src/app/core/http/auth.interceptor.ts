import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
// El interceptor de autenticación se encarga de agregar el token de autenticación a las solicitudes HTTP salientes,
// excepto para las solicitudes de inicio de sesión y registro. Esto permite que el token se envíe automáticamente
// en el encabezado Authorization de las solicitudes, lo que facilita la autenticación en el backend.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  // Se verifica si la solicitud es para los endpoints de autenticación (login o register) y si hay un token disponible.
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  // Si hay un token y la solicitud no es para los endpoints de autenticación, se clona la solicitud y se agrega el 
  // encabezado Authorization con el token.
  if (token && !isAuthEndpoint) {
    // Se clona la solicitud original y se agrega el encabezado Authorization con el token de autenticación.
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  // Se pasa la solicitud (modificada o no) al siguiente interceptor o al manejador de solicitudes HTTP.
  return next(req);
};
