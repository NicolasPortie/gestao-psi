import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AutenticacaoService } from '../autenticacao/autenticacao.service';

export const autenticacaoInterceptor: HttpInterceptorFn = (request, next) => {
  const autenticacaoService = inject(AutenticacaoService);
  const accessToken = autenticacaoService.obterAccessToken();
  const requestAutenticada = accessToken
    ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    : request;

  return next(requestAutenticada).pipe(
    catchError((erro: unknown) => {
      if (
        erro instanceof HttpErrorResponse &&
        erro.status === 401 &&
        !request.url.includes('/autenticacao/')
      ) {
        return autenticacaoService.renovarToken().pipe(
          switchMap((autenticacao) =>
            next(
              request.clone({
                setHeaders: {
                  Authorization: `Bearer ${autenticacao.accessToken}`,
                },
              }),
            ),
          ),
        );
      }

      return throwError(() => erro);
    }),
  );
};
