import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { Shell } from '../../layout/shell/shell';
import { AgendaService, BloqueioAgenda, HorarioDisponivel, TipoAtendimento } from './agenda.service';

type SecaoAgenda = 'regras' | 'tipos' | 'horarios' | 'bloqueios';

@Component({ selector: 'app-configuracoes-agenda', imports: [Shell, ReactiveFormsModule, CurrencyPipe, DatePipe, NgClass], templateUrl: './configuracoes-agenda.html' })
export class ConfiguracoesAgenda {
  private readonly agenda = inject(AgendaService);
  private readonly autenticacao = inject(AutenticacaoService);
  protected readonly usuario = this.autenticacao.usuarioAtual;
  protected readonly secao = signal<SecaoAgenda>('regras');
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly tipos = signal<TipoAtendimento[]>([]);
  protected readonly horarios = signal<HorarioDisponivel[]>([]);
  protected readonly bloqueios = signal<BloqueioAgenda[]>([]);
  protected readonly tipoEditandoId = signal<string | null>(null);
  protected readonly horarioEditandoId = signal<string | null>(null);
  protected readonly bloqueioEditandoId = signal<string | null>(null);

  protected readonly formConfiguracao = new FormGroup({ duracaoPadraoMinutos: new FormControl(50, { nonNullable: true, validators: [Validators.required, Validators.min(10), Validators.max(240)] }), confirmacaoAutomaticaConsulta: new FormControl(false, { nonNullable: true }), antecedenciaMinimaAgendamentoHoras: new FormControl<number | null>(null, [Validators.min(0), Validators.max(720)]), antecedenciaCancelamentoHoras: new FormControl<number | null>(null, [Validators.min(0), Validators.max(720)]), antecedenciaRemarcacaoHoras: new FormControl<number | null>(null, [Validators.min(0), Validators.max(720)]), exigeJustificativaCancelamento: new FormControl(true, { nonNullable: true }) });
  protected readonly formTipo = new FormGroup({ nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }), descricao: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }), duracaoMinutos: new FormControl(50, { nonNullable: true, validators: [Validators.required, Validators.min(10), Validators.max(240)] }), valorPadrao: new FormControl<number | null>(null, Validators.min(0)), modalidadePadrao: new FormControl('Presencial', { nonNullable: true }), ativo: new FormControl(true, { nonNullable: true }) });
  protected readonly formHorario = new FormGroup({ diaSemana: new FormControl('Segunda', { nonNullable: true }), horaInicio: new FormControl('08:00', { nonNullable: true, validators: Validators.required }), horaFim: new FormControl('18:00', { nonNullable: true, validators: Validators.required }), ativo: new FormControl(true, { nonNullable: true }) }, { validators: (controle) => controle.get('horaFim')?.value > controle.get('horaInicio')?.value ? null : { periodoInvalido: true } });
  protected readonly formBloqueio = new FormGroup({ titulo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }), descricao: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }), inicioEm: new FormControl('', { nonNullable: true, validators: Validators.required }), fimEm: new FormControl('', { nonNullable: true, validators: Validators.required }), diaInteiro: new FormControl(false, { nonNullable: true }) }, { validators: (controle) => !controle.get('inicioEm')?.value || !controle.get('fimEm')?.value || new Date(controle.get('fimEm')?.value) > new Date(controle.get('inicioEm')?.value) ? null : { periodoInvalido: true } });
  protected readonly totalAtivos = computed(() => this.tipos().filter((tipo) => tipo.ativo).length);

  constructor() { this.carregar(); }

  protected selecionarSecao(secao: SecaoAgenda): void { this.secao.set(secao); this.erro.set(''); this.mensagem.set(''); }
  protected salvarConfiguracao(): void { if (this.formConfiguracao.invalid) return this.marcarErro(this.formConfiguracao); this.executarSalvamento(this.agenda.salvarConfiguracao(this.formConfiguracao.getRawValue()), 'Configurações de atendimento salvas.'); }
  protected salvarTipo(): void { if (this.formTipo.invalid) return this.marcarErro(this.formTipo); const valor = this.formTipo.getRawValue(); this.salvando.set(true); this.limparFeedback(); this.agenda.salvarTipo(this.tipoEditandoId(), { ...valor, descricao: valor.descricao || undefined, valorPadrao: valor.valorPadrao ?? undefined }).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: (tipo) => { this.tipos.update((itens) => this.substituirOuAdicionar(itens, tipo)); this.cancelarTipo(); this.mensagem.set('Tipo de atendimento salvo.'); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected editarTipo(tipo: TipoAtendimento): void { this.tipoEditandoId.set(tipo.id); this.formTipo.reset({ nome: tipo.nome, descricao: tipo.descricao ?? '', duracaoMinutos: tipo.duracaoMinutos, valorPadrao: tipo.valorPadrao ?? null, modalidadePadrao: tipo.modalidadePadrao, ativo: tipo.ativo }); }
  protected alternarTipo(tipo: TipoAtendimento): void { this.formTipo.reset({ nome: tipo.nome, descricao: tipo.descricao ?? '', duracaoMinutos: tipo.duracaoMinutos, valorPadrao: tipo.valorPadrao ?? null, modalidadePadrao: tipo.modalidadePadrao, ativo: !tipo.ativo }); this.tipoEditandoId.set(tipo.id); this.salvarTipo(); }
  protected cancelarTipo(): void { this.tipoEditandoId.set(null); this.formTipo.reset({ nome: '', descricao: '', duracaoMinutos: 50, valorPadrao: null, modalidadePadrao: 'Presencial', ativo: true }); }
  protected salvarHorario(): void { if (this.formHorario.invalid) return this.marcarErro(this.formHorario); this.salvando.set(true); this.limparFeedback(); this.agenda.salvarHorario(this.horarioEditandoId(), this.formHorario.getRawValue()).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: (horario) => { this.horarios.update((itens) => this.substituirOuAdicionar(itens, horario)); this.cancelarHorario(); this.mensagem.set('Horário disponível salvo.'); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected editarHorario(horario: HorarioDisponivel): void { this.horarioEditandoId.set(horario.id); this.formHorario.reset({ diaSemana: horario.diaSemana, horaInicio: horario.horaInicio.slice(0, 5), horaFim: horario.horaFim.slice(0, 5), ativo: horario.ativo }); }
  protected alternarHorario(horario: HorarioDisponivel): void { this.horarioEditandoId.set(horario.id); this.formHorario.reset({ diaSemana: horario.diaSemana, horaInicio: horario.horaInicio.slice(0, 5), horaFim: horario.horaFim.slice(0, 5), ativo: !horario.ativo }); this.salvarHorario(); }
  protected cancelarHorario(): void { this.horarioEditandoId.set(null); this.formHorario.reset({ diaSemana: 'Segunda', horaInicio: '08:00', horaFim: '18:00', ativo: true }); }
  protected salvarBloqueio(): void { if (this.formBloqueio.invalid) return this.marcarErro(this.formBloqueio); const valor = this.formBloqueio.getRawValue(); this.salvando.set(true); this.limparFeedback(); this.agenda.salvarBloqueio(this.bloqueioEditandoId(), { titulo: valor.titulo, descricao: valor.descricao || undefined, inicioEm: new Date(valor.inicioEm).toISOString(), fimEm: new Date(valor.fimEm).toISOString(), diaInteiro: valor.diaInteiro }).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: (bloqueio) => { this.bloqueios.update((itens) => this.substituirOuAdicionar(itens, bloqueio)); this.cancelarBloqueio(); this.mensagem.set('Bloqueio de agenda salvo.'); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected editarBloqueio(bloqueio: BloqueioAgenda): void { this.bloqueioEditandoId.set(bloqueio.id); this.formBloqueio.reset({ titulo: bloqueio.titulo, descricao: bloqueio.descricao ?? '', inicioEm: this.dataLocal(bloqueio.inicioEm), fimEm: this.dataLocal(bloqueio.fimEm), diaInteiro: bloqueio.diaInteiro }); }
  protected removerBloqueio(bloqueio: BloqueioAgenda): void { this.salvando.set(true); this.limparFeedback(); this.agenda.removerBloqueio(bloqueio.id).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: () => { this.bloqueios.update((itens) => itens.filter((item) => item.id !== bloqueio.id)); this.mensagem.set('Bloqueio removido.'); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected cancelarBloqueio(): void { this.bloqueioEditandoId.set(null); this.formBloqueio.reset({ titulo: '', descricao: '', inicioEm: '', fimEm: '', diaInteiro: false }); }
  protected rotuloDia(dia: string): string { return dia.replace('Terca', 'Terça').replace('Sabado', 'Sábado'); }

  private carregar(): void { const inicio = new Date(); inicio.setFullYear(inicio.getFullYear() - 1); const fim = new Date(); fim.setFullYear(fim.getFullYear() + 2); forkJoin({ configuracao: this.agenda.obterConfiguracao(), tipos: this.agenda.tipos(), horarios: this.agenda.listarHorarios(), bloqueios: this.agenda.listarBloqueios(inicio.toISOString(), fim.toISOString()) }).pipe(finalize(() => this.carregando.set(false))).subscribe({ next: ({ configuracao, tipos, horarios, bloqueios }) => { this.formConfiguracao.reset({ ...configuracao, antecedenciaMinimaAgendamentoHoras: configuracao.antecedenciaMinimaAgendamentoHoras ?? null, antecedenciaCancelamentoHoras: configuracao.antecedenciaCancelamentoHoras ?? null, antecedenciaRemarcacaoHoras: configuracao.antecedenciaRemarcacaoHoras ?? null }); this.tipos.set(tipos); this.horarios.set(horarios); this.bloqueios.set(bloqueios); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  private executarSalvamento<T>(requisicao: import('rxjs').Observable<T>, mensagem: string): void { this.salvando.set(true); this.limparFeedback(); requisicao.pipe(finalize(() => this.salvando.set(false))).subscribe({ next: () => this.mensagem.set(mensagem), error: (erro: Error) => this.erro.set(erro.message) }); }
  private marcarErro(formulario: FormGroup): void { formulario.markAllAsTouched(); this.erro.set('Revise os campos destacados.'); }
  private limparFeedback(): void { this.erro.set(''); this.mensagem.set(''); }
  private substituirOuAdicionar<T extends { id: string }>(itens: T[], atualizado: T): T[] { return itens.some((item) => item.id === atualizado.id) ? itens.map((item) => item.id === atualizado.id ? atualizado : item) : [...itens, atualizado]; }
  private dataLocal(data: string): string { const valor = new Date(data); const deslocamento = valor.getTimezoneOffset() * 60_000; return new Date(valor.getTime() - deslocamento).toISOString().slice(0, 16); }
}
