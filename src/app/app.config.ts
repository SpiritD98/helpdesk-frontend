import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    // Dentro de provideHttpClient, se agregan los interceptores de autenticación 
    // y de manejo de errores para que se apliquen a todas las solicitudes HTTP realizadas 
    // por la aplicación. Esto permite que el token de autenticación se agregue automáticamente 
    // a las solicitudes y que los errores se manejen de manera centralizada.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideNativeDateAdapter(),
  ],
};
