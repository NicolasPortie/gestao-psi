import { Component, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  @Input({ required: true }) nomeUsuario = '';
  @Input() perfil = '';
  @Input() notificacoesNaoLidas = 0;

  protected sair(): void {
    this.autenticacaoService.sair().subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
}
