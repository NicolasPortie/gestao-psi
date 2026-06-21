import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { AutenticacaoService } from '../autenticacao/autenticacao.service';

export const naoAutenticadoGuard: CanActivateFn = () => {
  const autenticacaoService = inject(AutenticacaoService);
  const router = inject(Router);

  return autenticacaoService
    .restaurarSessao()
    .pipe(map((autenticado) => (autenticado ? router.createUrlTree(['/painel']) : true)));
};
