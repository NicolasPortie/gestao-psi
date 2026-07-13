import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';

import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { Shell } from '../../layout/shell/shell';
import { AgendaService, Consulta } from '../agenda/agenda.service';
import { PacienteLista } from '../pacientes/models/paciente.model';
import { PacientesService } from '../pacientes/services/pacientes.service';
import { Pagamento, PagamentosService } from './pagamentos.service';

@Component({ selector: 'app-pagamentos', imports: [Shell, ReactiveFormsModule, CurrencyPipe, DatePipe, NgClass, RouterLink], templateUrl: './pagamentos.html' })
export class Pagamentos {
  private readonly pagamentosService = inject(PagamentosService);
  private readonly pacientesService = inject(PacientesService);
  private readonly agendaService = inject(AgendaService);
  private readonly autenticacao = inject(AutenticacaoService);

  protected readonly usuario = this.autenticacao.usuarioAtual;
  protected readonly pagamentos = signal<Pagamento[]>([]);
  protected readonly pacientes = signal<PacienteLista[]>([]);
  protected readonly consultas = signal<Consulta[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly pagamentoAtualizadoId = signal<string | null>(null);
  protected readonly filtroStatus = new FormControl<'Todos' | Pagamento['status']>('Todos', { nonNullable: true });
  protected readonly filtroPaciente = new FormControl('', { nonNullable: true });
  protected readonly filtroForma = new FormControl('', { nonNullable: true });
  protected readonly filtroInicio = new FormControl('', { nonNullable: true });
  protected readonly filtroFim = new FormControl('', { nonNullable: true });
  protected readonly form = new FormGroup({ pacienteId: new FormControl('', { nonNullable: true, validators: Validators.required }), consultaId: new FormControl('', { nonNullable: true }), valor: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]), formaPagamento: new FormControl('Pix', { nonNullable: true }), vencimentoEm: new FormControl('', { nonNullable: true }), observacao: new FormControl('', { nonNullable: true, validators: Validators.maxLength(1000) }) });

  private readonly filtroStatusValor = toSignal(this.filtroStatus.valueChanges, { initialValue: this.filtroStatus.value });
  private readonly filtroPacienteValor = toSignal(this.filtroPaciente.valueChanges, { initialValue: this.filtroPaciente.value });
  private readonly filtroFormaValor = toSignal(this.filtroForma.valueChanges, { initialValue: this.filtroForma.value });
  private readonly filtroInicioValor = toSignal(this.filtroInicio.valueChanges, { initialValue: this.filtroInicio.value });
  private readonly filtroFimValor = toSignal(this.filtroFim.valueChanges, { initialValue: this.filtroFim.value });
  private readonly pacienteLancamentoId = toSignal(this.form.controls.pacienteId.valueChanges, { initialValue: this.form.controls.pacienteId.value });

  protected readonly consultasDoPaciente = computed(() => this.consultas().filter((consulta) => consulta.pacienteId === this.pacienteLancamentoId()));
  protected readonly pagamentosFiltrados = computed(() => this.pagamentos().filter((pagamento) => {
    if (this.filtroStatusValor() !== 'Todos' && pagamento.status !== this.filtroStatusValor()) return false;
    if (this.filtroPacienteValor() && pagamento.pacienteId !== this.filtroPacienteValor()) return false;
    if (this.filtroFormaValor() && pagamento.formaPagamento !== this.filtroFormaValor()) return false;
    const referencia = pagamento.vencimentoEm ?? pagamento.pagoEm;
    if (this.filtroInicioValor() && (!referencia || new Date(referencia) < new Date(`${this.filtroInicioValor()}T00:00:00`))) return false;
    if (this.filtroFimValor() && (!referencia || new Date(referencia) > new Date(`${this.filtroFimValor()}T23:59:59`))) return false;
    return true;
  }));
  protected readonly totalPendente = computed(() => this.somarStatus('Pendente'));
  protected readonly totalRecebido = computed(() => this.somarStatus('Pago'));
  protected readonly totalReembolsado = computed(() => this.somarStatus('Reembolsado'));
  protected readonly pagamentosVencidos = computed(() => this.pagamentos().filter((item) => this.estaVencido(item)).length);

  constructor() {
    this.carregarDados();
    this.form.controls.pacienteId.valueChanges.subscribe(() => this.form.controls.consultaId.setValue(''));
  }

  protected carregarDados(): void {
    const inicio = new Date(); inicio.setFullYear(inicio.getFullYear() - 1);
    const fim = new Date(); fim.setFullYear(fim.getFullYear() + 1);
    this.carregando.set(true);
    this.erro.set('');
    forkJoin({ pagamentos: this.pagamentosService.listar(), pacientes: this.pacientesService.listar({ status: 'Ativo', tamanhoPagina: 100 }), consultas: this.agendaService.listar(inicio.toISOString(), fim.toISOString()) }).pipe(finalize(() => this.carregando.set(false))).subscribe({
      next: ({ pagamentos, pacientes, consultas }) => { this.pagamentos.set(pagamentos); this.pacientes.set(pacientes.itens); this.consultas.set(consultas); },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected salvar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); this.erro.set('Revise os campos obrigatórios do lançamento.'); return; }
    const valor = this.form.getRawValue(); this.salvando.set(true); this.erro.set(''); this.mensagem.set('');
    this.pagamentosService.criar({ pacienteId: valor.pacienteId, consultaId: valor.consultaId || undefined, valor: valor.valor!, formaPagamento: valor.formaPagamento, vencimentoEm: valor.vencimentoEm ? new Date(`${valor.vencimentoEm}T12:00:00`).toISOString() : undefined, observacao: valor.observacao || undefined }).pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (pagamento) => { this.pagamentos.update((itens) => [pagamento, ...itens]); this.form.reset({ pacienteId: '', consultaId: '', valor: null, formaPagamento: 'Pix', vencimentoEm: '', observacao: '' }); this.mensagem.set('Pagamento registrado com sucesso.'); this.destacar(pagamento.id); },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected alterarStatus(pagamento: Pagamento, status: 'Pago' | 'Cancelado' | 'Reembolsado'): void {
    this.erro.set(''); this.mensagem.set('');
    this.pagamentosService.alterarStatus(pagamento.id, status).subscribe({
      next: (atualizado) => { this.pagamentos.update((itens) => itens.map((item) => item.id === atualizado.id ? atualizado : item)); this.mensagem.set(`Pagamento marcado como ${status.toLowerCase()}.`); this.destacar(atualizado.id); },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected limparFiltros(): void { this.filtroStatus.setValue('Todos'); this.filtroPaciente.setValue(''); this.filtroForma.setValue(''); this.filtroInicio.setValue(''); this.filtroFim.setValue(''); }
  protected classeStatus(status: Pagamento['status']): string { if (status === 'Pago') return 'bg-[#eaf5eb] text-[#28563b]'; if (status === 'Pendente') return 'bg-[#fff8df] text-[#725519]'; if (status === 'Reembolsado') return 'bg-[#eff3f0] text-[#4f6253]'; return 'bg-[#fff0ed] text-[#a12d24]'; }
  protected estaVencido(pagamento: Pagamento): boolean { return pagamento.status === 'Pendente' && Boolean(pagamento.vencimentoEm) && new Date(pagamento.vencimentoEm!) < new Date(); }
  protected consultaVinculada(id?: string): Consulta | undefined { return id ? this.consultas().find((consulta) => consulta.id === id) : undefined; }
  private somarStatus(status: Pagamento['status']): number { return this.pagamentosFiltrados().filter((item) => item.status === status).reduce((total, item) => total + item.valor, 0); }
  private destacar(id: string): void { this.pagamentoAtualizadoId.set(id); setTimeout(() => this.pagamentoAtualizadoId.set(null), 1400); }
}
