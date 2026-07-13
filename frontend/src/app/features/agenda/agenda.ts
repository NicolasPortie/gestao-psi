import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { Shell } from '../../layout/shell/shell';
import { AgendaService, Consulta } from './agenda.service';

interface DiaAgenda { data: Date; consultas: Consulta[]; }

@Component({ selector: 'app-agenda', imports: [Shell, RouterLink, DatePipe, NgClass, ReactiveFormsModule], templateUrl: './agenda.html' })
export class Agenda {
  private readonly agenda = inject(AgendaService);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly formatadorChaveData = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' });

  protected readonly usuario = this.autenticacao.usuarioAtual;
  protected readonly consultas = signal<Consulta[]>([]);
  protected readonly inicioPeriodo = signal(this.inicioDaSemana(new Date()));
  protected readonly carregando = signal(true);
  protected readonly erro = signal('');
  protected readonly filtroStatus = new FormControl('', { nonNullable: true });
  protected readonly consultasFiltradas = computed(() => {
    const status = this.filtroStatus.value;
    return status ? this.consultas().filter((consulta) => consulta.status === status) : this.consultas();
  });
  protected readonly dias = computed<DiaAgenda[]>(() => {
    const porDia = new Map<string, Consulta[]>();
    for (const consulta of this.consultasFiltradas()) {
      const chave = this.formatadorChaveData.format(new Date(consulta.inicioEm));
      porDia.set(chave, [...(porDia.get(chave) ?? []), consulta]);
    }
    return Array.from({ length: 7 }, (_, indice) => {
      const data = new Date(this.inicioPeriodo()); data.setDate(data.getDate() + indice);
      return { data, consultas: porDia.get(this.formatadorChaveData.format(data)) ?? [] };
    });
  });
  protected readonly totalPeriodo = computed(() => this.consultasFiltradas().length);

  constructor() { this.carregar(); }

  protected periodoAnterior(): void { this.moverPeriodo(-7); }
  protected proximoPeriodo(): void { this.moverPeriodo(7); }
  protected irParaHoje(): void { this.inicioPeriodo.set(this.inicioDaSemana(new Date())); this.carregar(); }

  protected carregar(): void {
    const inicio = this.inicioPeriodo(); const fim = new Date(inicio); fim.setDate(fim.getDate() + 7);
    this.carregando.set(true); this.erro.set('');
    this.agenda.listar(inicio.toISOString(), fim.toISOString()).pipe(finalize(() => this.carregando.set(false))).subscribe({
      next: (dados) => this.consultas.set(dados), error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected faixaPeriodo(): string {
    const inicio = this.inicioPeriodo(); const fim = new Date(inicio); fim.setDate(fim.getDate() + 6);
    return `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} a ${fim.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  }

  protected classeStatus(status: string): string {
    if (status === 'Confirmada' || status === 'Realizada') return 'bg-[#eaf5eb] text-[#28563b]';
    if (status === 'Cancelada' || status === 'NaoCompareceu') return 'bg-[#fff0ed] text-[#a12d24]';
    return 'bg-[#fff8df] text-[#725519]';
  }

  protected rotuloStatus(status: string): string {
    if (status === 'AguardandoConfirmacao') return 'Aguardando confirmação';
    if (status === 'NaoCompareceu') return 'Não compareceu';
    return status;
  }

  protected ehHoje(data: Date): boolean { return this.formatadorChaveData.format(data) === this.formatadorChaveData.format(new Date()); }

  private moverPeriodo(dias: number): void { const inicio = new Date(this.inicioPeriodo()); inicio.setDate(inicio.getDate() + dias); this.inicioPeriodo.set(inicio); this.carregar(); }
  private inicioDaSemana(data: Date): Date { const inicio = new Date(data); inicio.setHours(0, 0, 0, 0); inicio.setDate(inicio.getDate() - inicio.getDay()); return inicio; }
}
