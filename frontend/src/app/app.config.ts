import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { API_URL_BASE } from './core/api/api.config';
import { autenticacaoInterceptor } from './core/interceptors/autenticacao.interceptor';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([autenticacaoInterceptor])),
    provideRouter(routes),
    {
      provide: API_URL_BASE,
      useValue: 'http://localhost:5178/api/v1',
    },
    {
      provide: LOCALE_ID,
      useValue: 'pt-BR',
    },
    providePrimeNG({
      ripple: true,
      theme: {
        preset: Aura,
      },
    }),
  ],
};
