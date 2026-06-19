import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { AutenticacaoService } from '../autenticacao/autenticacao.service';

export const autenticadoGuard: CanActivateFn = () => {
  const autenticacaoService = inject(AutenticacaoService);
  const router = inject(Router);

  if (autenticacaoService.obterAccessToken()) {
    return true;
  }

  return autenticacaoService.renovarToken().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login']))),
  );
};
