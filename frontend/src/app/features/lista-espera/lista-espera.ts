import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { Shell } from '../../layout/shell/shell';
import { AgendaService, TipoAtendimento } from '../agenda/agenda.service';
import { PacienteLista } from '../pacientes/models/paciente.model';
import { PacientesService } from '../pacientes/services/pacientes.service';
import {
  DiaSemana,
  FiltrosListaEspera,
  ItemListaEspera,
  ListaEsperaService,
  OrigemListaEspera,
  StatusListaEspera,
} from './lista-espera.service';

@Component({
  selector: 'app-lista-espera',
  imports: [Shell, ReactiveFormsModule, RouterLink, DatePipe, NgClass],
  templateUrl: './lista-espera.html',
})
export class ListaEspera {
  private readonly listaEsperaService = inject(ListaEsperaService);
  private readonly pacientesService = inject(PacientesService);
  private readonly agendaService = inject(AgendaService);
  private readonly autenticacao = inject(AutenticacaoService);

  protected readonly usuario = this.autenticacao.usuarioAtual;
  protected readonly itens = signal<ItemListaEspera[]>([]);
  protected readonly pacientes = signal<PacienteLista[]>([]);
  protected readonly tipos = signal<TipoAtendimento[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly itemAtualizadoId = signal<string | null>(null);

  protected readonly filtros = new FormGroup({
    status: new FormControl('', { nonNullable: true }),
    tipoAtendimentoId: new FormControl('', { nonNullable: true }),
    prioridade: new FormControl('', { nonNullable: true }),
    origem: new FormControl('', { nonNullable: true }),
  });

  protected readonly formulario = new FormGroup(
    {
      pacienteId: new FormControl('', { nonNullable: true, validators: Validators.required }),
      tipoAtendimentoId: new FormControl('', { nonNullable: true }),
      preferenciaDiaSemana: new FormControl('', { nonNullable: true }),
      preferenciaHorarioInicio: new FormControl('', { nonNullable: true }),
      preferenciaHorarioFim: new FormControl('', { nonNullable: true }),
      prioridade: new FormControl(2, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1), Validators.max(3)],
      }),
      observacaoAdministrativa: new FormControl('', {
        nonNullable: true,
        validators: Validators.maxLength(1000),
      }),
    },
    { validators: (controle) => this.validarPreferenciaHorario(controle) },
  );

  protected readonly aguardando = computed(
    () => this.itens().filter((item) => item.status === 'Aguardando').length,
  );
  protected readonly contatados = computed(
    () => this.itens().filter((item) => item.status === 'Contatado').length,
  );
  protected readonly altaPrioridade = computed(
    () =>
      this.itens().filter(
        (item) =>
          item.prioridade === 1 && (item.status === 'Aguardando' || item.status === 'Contatado'),
      ).length,
  );

  constructor() {
    this.carregarDados();
  }

  protected carregarDados(): void {
    this.carregando.set(true);
    this.erro.set('');
    forkJoin({
      itens: this.listaEsperaService.listar(this.obterFiltros()),
      pacientes: this.pacientesService.listar({ status: 'Ativo', tamanhoPagina: 100 }),
      tipos: this.agendaService.tipos(),
    })
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: ({ itens, pacientes, tipos }) => {
          this.itens.set(itens);
          this.pacientes.set(pacientes.itens);
          this.tipos.set(tipos.filter((tipo) => tipo.ativo));
        },
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected aplicarFiltros(): void {
    this.carregando.set(true);
    this.erro.set('');
    this.listaEsperaService
      .listar(this.obterFiltros())
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (itens) => this.itens.set(itens),
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected limparFiltros(): void {
    this.filtros.reset({ status: '', tipoAtendimentoId: '', prioridade: '', origem: '' });
    this.aplicarFiltros();
  }

  protected adicionar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      setTimeout(() =>
        document.querySelector<HTMLElement>('#form-lista-espera [aria-invalid="true"]')?.focus(),
      );
      return;
    }

    const valor = this.formulario.getRawValue();
    this.salvando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    this.listaEsperaService
      .criar({
        pacienteId: valor.pacienteId,
        tipoAtendimentoId: valor.tipoAtendimentoId || undefined,
        preferenciaDiaSemana: (valor.preferenciaDiaSemana || undefined) as DiaSemana | undefined,
        preferenciaHorarioInicio: valor.preferenciaHorarioInicio || undefined,
        preferenciaHorarioFim: valor.preferenciaHorarioFim || undefined,
        prioridade: valor.prioridade,
        observacaoAdministrativa: valor.observacaoAdministrativa || undefined,
      })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: (item) => {
          this.itens.update((itens) => [item, ...itens]);
          this.formulario.reset({
            pacienteId: '',
            tipoAtendimentoId: '',
            preferenciaDiaSemana: '',
            preferenciaHorarioInicio: '',
            preferenciaHorarioFim: '',
            prioridade: 2,
            observacaoAdministrativa: '',
          });
          this.mensagem.set('Paciente adicionado à lista de espera.');
          this.destacar(item.id);
        },
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected alterarStatus(
    item: ItemListaEspera,
    status: 'Contatado' | 'Cancelado' | 'Expirado',
  ): void {
    this.salvando.set(true);
    this.erro.set('');
    this.mensagem.set('');
    this.listaEsperaService
      .alterarStatus(item.id, status)
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: (atualizado) => {
          this.itens.update((itens) =>
            itens.map((registro) => (registro.id === atualizado.id ? atualizado : registro)),
          );
          this.mensagem.set(
            status === 'Contatado'
              ? 'Contato registrado.'
              : 'Registro encerrado na lista de espera.',
          );
          this.destacar(atualizado.id);
        },
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected horario(item: ItemListaEspera): string {
    if (!item.preferenciaHorarioInicio || !item.preferenciaHorarioFim) return 'Horário flexível';
    return `${item.preferenciaHorarioInicio.slice(0, 5)} às ${item.preferenciaHorarioFim.slice(0, 5)}`;
  }

  protected rotuloDia(dia?: DiaSemana): string {
    if (dia === 'Terca') return 'Terça';
    if (dia === 'Sabado') return 'Sábado';
    return dia ?? 'Qualquer dia';
  }

  protected rotuloPrioridade(prioridade: number): string {
    return prioridade === 1 ? 'Alta' : prioridade === 3 ? 'Baixa' : 'Normal';
  }

  protected classePrioridade(prioridade: number): string {
    if (prioridade === 1) return 'bg-[#fff0ed] text-[#a12d24]';
    if (prioridade === 3) return 'bg-[#eff1ee] text-[#5f655e]';
    return 'bg-[#fff8df] text-[#725519]';
  }

  protected classeStatus(status: StatusListaEspera): string {
    if (status === 'Aguardando') return 'bg-[#fff8df] text-[#725519]';
    if (status === 'Contatado') return 'bg-[#e8f0fa] text-[#315a7d]';
    if (status === 'Agendado') return 'bg-[#eaf5eb] text-[#28563b]';
    return 'bg-[#eff1ee] text-[#5f655e]';
  }

  protected preferenciaHorarioInvalida(): boolean {
    return (
      Boolean(this.formulario.errors?.['preferenciaHorarioInvalida']) && this.formulario.touched
    );
  }

  private obterFiltros(): FiltrosListaEspera {
    const valor = this.filtros.getRawValue();
    return {
      status: (valor.status || undefined) as StatusListaEspera | undefined,
      tipoAtendimentoId: valor.tipoAtendimentoId || undefined,
      prioridade: valor.prioridade ? Number(valor.prioridade) : undefined,
      origem: (valor.origem || undefined) as OrigemListaEspera | undefined,
    };
  }

  private validarPreferenciaHorario(controle: AbstractControl): ValidationErrors | null {
    const inicio = controle.get('preferenciaHorarioInicio')?.value;
    const fim = controle.get('preferenciaHorarioFim')?.value;
    if (!inicio && !fim) return null;
    return !inicio || !fim || fim <= inicio ? { preferenciaHorarioInvalida: true } : null;
  }

  private destacar(id: string): void {
    this.itemAtualizadoId.set(id);
    setTimeout(() => this.itemAtualizadoId.set(null), 1400);
  }
}
