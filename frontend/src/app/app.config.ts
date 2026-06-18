import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { API_URL_BASE } from './core/api/api.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    {
      provide: API_URL_BASE,
      useValue: 'http://localhost:5178/api/v1',
    },
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
      },
    }),
  ],
};
