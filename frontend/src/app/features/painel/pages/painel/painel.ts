import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Shell } from '../../../../layout/shell/shell';
import { AcaoRapidaCard } from '../../components/acao-rapida-card/acao-rapida-card';
import { AlertaPainelItem } from '../../components/alerta-painel-item/alerta-painel-item';
import { ConsultaHojeItem } from '../../components/consulta-hoje-item/consulta-hoje-item';
import { PainelResumo } from '../../models/painel.model';
import { PainelService } from '../../services/painel.service';

@Component({
  selector: 'app-painel',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgClass,
    ButtonModule,
    RouterLink,
    Shell,
    AcaoRapidaCard,
    AlertaPainelItem,
    ConsultaHojeItem,
  ],
  templateUrl: './painel.html',
})
export class Painel {
  private readonly painelService = inject(PainelService);

  protected readonly hoje = new Date();
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly resumo = signal<PainelResumo | null>(null);
  protected readonly focoDoDia = computed(() => {
    const dados = this.resumo();
    if (!dados) {
      return 'Carregando rotina administrativa';
    }

    if (dados.indicadores.consultasHoje === 0) {
      return 'Dia livre para organizar agenda, pagamentos e documentos.';
    }

    if (dados.indicadores.consultasRestantesHoje === 1) {
      return 'Ainda existe 1 atendimento para acompanhar hoje.';
    }

    return `Ainda existem ${dados.indicadores.consultasRestantesHoje} atendimentos para acompanhar hoje.`;
  });

  protected readonly saudacao = computed(() => {
    const hora = new Date().getHours();
    if (hora < 12) {
      return 'Bom dia';
    }

    if (hora < 18) {
      return 'Boa tarde';
    }

    return 'Boa noite';
  });

  constructor() {
    this.carregarResumo();
  }

  protected carregarResumo(): void {
    this.carregando.set(true);
    this.erro.set('');

    this.painelService
      .obterResumo()
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (resumo) => this.resumo.set(resumo),
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected larguraDiaSemana(consultas: number): number {
    const valores = this.resumo()?.visaoSemana.map((dia) => dia.consultas) ?? [];
    const maiorValor = Math.max(...valores, 1);
    return consultas === 0 ? 4 : Math.max(12, Math.round((consultas / maiorValor) * 100));
  }

  protected classePrioridade(tom: string): string {
    if (tom === 'erro') {
      return 'border-[#ffdad6] bg-[#fff4f2] text-[#ba1a1a]';
    }

    if (tom === 'alerta' || tom === 'atencao') {
      return 'border-[#e8d7a7] bg-[#fff8df] text-[#6b541b]';
    }

    if (tom === 'ok') {
      return 'border-[#c6eccd] bg-[#f2fbf4] text-[#2d4e37]';
    }

    return 'border-[#eae1d9] bg-[#fcfaf7] text-[#5a554f]';
  }
}
