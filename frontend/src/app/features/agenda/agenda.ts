import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Shell } from '../../layout/shell/shell';
import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { AgendaService, Consulta } from './agenda.service';

@Component({ selector: 'app-agenda', imports: [Shell, RouterLink, DatePipe], templateUrl: './agenda.html' })
export class Agenda {
  private readonly agenda = inject(AgendaService); private readonly autenticacao = inject(AutenticacaoService);
  protected readonly usuario = this.autenticacao.usuarioAtual; protected readonly consultas = signal<Consulta[]>([]); protected readonly carregando = signal(true); protected readonly erro = signal('');
  constructor() { const inicio = new Date(); inicio.setHours(0, 0, 0, 0); const fim = new Date(inicio); fim.setDate(fim.getDate() + 7); this.agenda.listar(inicio.toISOString(), fim.toISOString()).pipe(finalize(() => this.carregando.set(false))).subscribe({ next: (dados) => this.consultas.set(dados), error: (erro: Error) => this.erro.set(erro.message) }); }
}
