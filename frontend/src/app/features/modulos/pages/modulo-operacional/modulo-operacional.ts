import { Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { Shell } from '../../../../layout/shell/shell';

interface ModuloOperacionalData {
  titulo: string;
  icone: string;
  etiqueta: string;
}

@Component({
  selector: 'app-modulo-operacional',
  imports: [NgClass, RouterLink, Shell],
  templateUrl: './modulo-operacional.html',
})
export class ModuloOperacional {
  private readonly route = inject(ActivatedRoute);
  private readonly autenticacaoService = inject(AutenticacaoService);

  protected readonly usuario = computed(
    () => this.autenticacaoService.usuarioAtual()?.usuario,
  );

  protected readonly data = computed<ModuloOperacionalData>(() => ({
    titulo: this.route.snapshot.data['titulo'] ?? 'Funcionalidade em preparacao',
    icone: this.route.snapshot.data['icone'] ?? 'pi-briefcase',
    etiqueta: this.route.snapshot.data['etiqueta'] ?? 'GestaoPsi',
  }));
}
