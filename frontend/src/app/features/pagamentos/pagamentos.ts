import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Shell } from '../../layout/shell/shell';
import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { PacientesService } from '../pacientes/services/pacientes.service';
import { PacienteLista } from '../pacientes/models/paciente.model';
import { Pagamento, PagamentosService } from './pagamentos.service';

@Component({ selector: 'app-pagamentos', imports: [Shell, ReactiveFormsModule, CurrencyPipe, DatePipe, NgClass], templateUrl: './pagamentos.html' })
export class Pagamentos {
  private readonly pagamentosService = inject(PagamentosService); private readonly pacientesService = inject(PacientesService); private readonly autenticacao = inject(AutenticacaoService);
  protected readonly usuario = this.autenticacao.usuarioAtual; protected readonly pagamentos = signal<Pagamento[]>([]); protected readonly pacientes = signal<PacienteLista[]>([]); protected readonly carregando = signal(true); protected readonly salvando = signal(false); protected readonly erro = signal(''); protected readonly mensagem = signal('');
  protected readonly filtroStatus = new FormControl<'Todos' | Pagamento['status']>('Todos', { nonNullable: true });
  protected readonly pagamentosFiltrados = computed(() => this.filtroStatus.value === 'Todos' ? this.pagamentos() : this.pagamentos().filter((pagamento) => pagamento.status === this.filtroStatus.value));
  protected readonly totalPendente = computed(() => this.pagamentos().filter((item) => item.status === 'Pendente').reduce((total, item) => total + item.valor, 0));
  protected readonly totalRecebido = computed(() => this.pagamentos().filter((item) => item.status === 'Pago').reduce((total, item) => total + item.valor, 0));
  protected readonly form = new FormGroup({ pacienteId: new FormControl('', { nonNullable: true, validators: Validators.required }), valor: new FormControl<number | null>(null, Validators.required), formaPagamento: new FormControl('Pix', { nonNullable: true }), vencimentoEm: new FormControl(''), observacao: new FormControl('') });
  constructor() { forkJoin({ pagamentos: this.pagamentosService.listar(), pacientes: this.pacientesService.listar({ status: 'Ativo', tamanhoPagina: 100 }) }).pipe(finalize(() => this.carregando.set(false))).subscribe({ next: ({ pagamentos, pacientes }) => { this.pagamentos.set(pagamentos); this.pacientes.set(pacientes.itens); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected salvar(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const valor = this.form.getRawValue(); this.salvando.set(true); this.erro.set(''); this.pagamentosService.criar({ pacienteId: valor.pacienteId, valor: valor.valor!, formaPagamento: valor.formaPagamento, vencimentoEm: valor.vencimentoEm ? new Date(valor.vencimentoEm).toISOString() : undefined, observacao: valor.observacao || undefined }).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: (pagamento) => { this.pagamentos.update((itens) => [pagamento, ...itens]); this.form.reset({ pacienteId: '', valor: null, formaPagamento: 'Pix', vencimentoEm: '', observacao: '' }); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected alterarStatus(pagamento: Pagamento, status: 'Pago' | 'Cancelado' | 'Reembolsado'): void { this.erro.set(''); this.mensagem.set(''); this.pagamentosService.alterarStatus(pagamento.id, status).subscribe({ next: (atualizado) => { this.pagamentos.update((itens) => itens.map((item) => item.id === atualizado.id ? atualizado : item)); this.mensagem.set(`Pagamento marcado como ${status.toLowerCase()}.`); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected classeStatus(status: Pagamento['status']): string { if (status === 'Pago') return 'bg-[#eaf5eb] text-[#28563b]'; if (status === 'Pendente') return 'bg-[#fff8df] text-[#725519]'; if (status === 'Reembolsado') return 'bg-[#eff3f0] text-[#4f6253]'; return 'bg-[#fff0ed] text-[#a12d24]'; }
}
