import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { Shell } from '../../../../layout/shell/shell';
import {
  PacienteLista,
  PacientesListagem,
  StatusPaciente,
} from '../../models/paciente.model';
import { PacientesService } from '../../services/pacientes.service';

@Component({
  selector: 'app-lista-pacientes',
  imports: [DatePipe, NgClass, ReactiveFormsModule, RouterLink, Shell],
  templateUrl: './lista-pacientes.html',
})
export class ListaPacientes implements OnInit {
  private readonly pacientesService = inject(PacientesService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly formatadorDataCurta = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  protected readonly usuario = computed(
    () => this.autenticacaoService.usuarioAtual()?.usuario,
  );

  protected readonly busca = new FormControl('', { nonNullable: true });
  protected readonly status = new FormControl<StatusPaciente | ''>('', {
    nonNullable: true,
  });

  protected readonly carregando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly listagem = signal<PacientesListagem | null>(null);
  protected readonly pacienteSelecionadoId = signal<string | null>(null);

  protected readonly pacientes = computed(() => this.listagem()?.itens ?? []);
  protected readonly pacienteSelecionado = computed(() => {
    const pacientes = this.pacientes();
    const idSelecionado = this.pacienteSelecionadoId();

    return pacientes.find((paciente) => paciente.id === idSelecionado) ?? pacientes[0] ?? null;
  });

  ngOnInit(): void {
    this.carregar();
  }

  protected carregar(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.mensagem.set('');

    this.pacientesService
      .listar({
        busca: this.busca.value,
        status: this.status.value,
        pagina: 1,
        tamanhoPagina: 20,
      })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (listagem) => {
          this.listagem.set(listagem);

          const pacienteAtualAindaExiste = listagem.itens.some(
            (paciente) => paciente.id === this.pacienteSelecionadoId(),
          );

          if (!pacienteAtualAindaExiste) {
            this.pacienteSelecionadoId.set(listagem.itens[0]?.id ?? null);
          }
        },
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected limparFiltros(): void {
    this.busca.setValue('');
    this.status.setValue('');
    this.carregar();
  }

  protected selecionarPaciente(paciente: PacienteLista): void {
    this.pacienteSelecionadoId.set(paciente.id);
  }

  protected alternarStatus(paciente: PacienteLista): void {
    this.carregando.set(true);
    this.erro.set('');
    this.mensagem.set('');

    const requisicao =
      paciente.status === 'Ativo'
        ? this.pacientesService.inativar(paciente.id)
        : this.pacientesService.ativar(paciente.id);

    requisicao.pipe(finalize(() => this.carregando.set(false))).subscribe({
      next: () => {
        this.mensagem.set(
          paciente.status === 'Ativo'
            ? 'Paciente inativado com sucesso.'
            : 'Paciente ativado com sucesso.',
        );
        this.carregar();
      },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected classeStatus(status: StatusPaciente): string {
    if (status === 'Ativo') {
      return 'border-[#abcfb2] bg-[#eef8f0] text-[#2d4e37]';
    }

    if (status === 'Inativo') {
      return 'border-[#e8d7a7] bg-[#fff8df] text-[#6b541b]';
    }

    return 'border-[#d8cdc3] bg-[#f4f0ea] text-[#5a554f]';
  }

  protected rotuloData(data: string | null): string {
    return data ? data : 'Sem registro';
  }

  protected iniciais(nome: string): string {
    const partes = nome
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (partes.length === 0) {
      return 'GP';
    }

    return partes
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('')
      .toUpperCase();
  }

  protected resumoUltimaConsulta(paciente: PacienteLista): string {
    if (!paciente.ultimaConsulta) {
      return 'Sem consulta';
    }

    return `Ultima: ${this.formatadorDataCurta.format(new Date(paciente.ultimaConsulta))}`;
  }

  protected contatoPrincipal(paciente: PacienteLista): string {
    return paciente.whatsApp ?? paciente.telefone ?? 'Sem telefone';
  }

  protected rotuloStatusDetalhe(status: StatusPaciente): string {
    if (status === 'Ativo') {
      return 'Paciente ativo';
    }

    if (status === 'Inativo') {
      return 'Paciente inativo';
    }

    return 'Paciente arquivado';
  }

  protected classeCartaoPaciente(paciente: PacienteLista): string {
    const selecionado = this.pacienteSelecionado()?.id === paciente.id;

    if (selecionado) {
      return 'border-[#44664e]/30 bg-[#eef8f0] shadow-[0_10px_24px_-18px_rgba(68,102,78,0.8)]';
    }

    return 'border-[#eae1d9] bg-white hover:border-[#d8cdc3] hover:bg-[#fcfaf7]';
  }

  protected classeAvatarPaciente(paciente: PacienteLista): string {
    return this.pacienteSelecionado()?.id === paciente.id
      ? 'bg-[#44664e] text-white'
      : 'bg-[#eae1d9] text-[#5a554f]';
  }
}
