import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Shell } from '../../layout/shell/shell';
import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { PacientesService } from '../pacientes/services/pacientes.service';
import { PacienteLista } from '../pacientes/models/paciente.model';
import { Pagamento, PagamentosService } from './pagamentos.service';

@Component({ selector: 'app-pagamentos', imports: [Shell, ReactiveFormsModule, CurrencyPipe, DatePipe], templateUrl: './pagamentos.html' })
export class Pagamentos {
  private readonly pagamentosService = inject(PagamentosService); private readonly pacientesService = inject(PacientesService); private readonly autenticacao = inject(AutenticacaoService);
  protected readonly usuario = this.autenticacao.usuarioAtual; protected readonly pagamentos = signal<Pagamento[]>([]); protected readonly pacientes = signal<PacienteLista[]>([]); protected readonly carregando = signal(true); protected readonly salvando = signal(false); protected readonly erro = signal('');
  protected readonly form = new FormGroup({ pacienteId: new FormControl('', { nonNullable: true, validators: Validators.required }), valor: new FormControl<number | null>(null, Validators.required), formaPagamento: new FormControl('Pix', { nonNullable: true }), vencimentoEm: new FormControl(''), observacao: new FormControl('') });
  constructor() { forkJoin({ pagamentos: this.pagamentosService.listar(), pacientes: this.pacientesService.listar({ status: 'Ativo', tamanhoPagina: 100 }) }).pipe(finalize(() => this.carregando.set(false))).subscribe({ next: ({ pagamentos, pacientes }) => { this.pagamentos.set(pagamentos); this.pacientes.set(pacientes.itens); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected salvar(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const valor = this.form.getRawValue(); this.salvando.set(true); this.erro.set(''); this.pagamentosService.criar({ pacienteId: valor.pacienteId, valor: valor.valor!, formaPagamento: valor.formaPagamento, vencimentoEm: valor.vencimentoEm ? new Date(valor.vencimentoEm).toISOString() : undefined, observacao: valor.observacao || undefined }).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: (pagamento) => { this.pagamentos.update((itens) => [pagamento, ...itens]); this.form.reset({ pacienteId: '', valor: null, formaPagamento: 'Pix', vencimentoEm: '', observacao: '' }); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected marcarComoPago(pagamento: Pagamento): void { this.pagamentosService.marcarComoPago(pagamento.id).subscribe({ next: (atualizado) => this.pagamentos.update((itens) => itens.map((item) => item.id === atualizado.id ? atualizado : item)), error: (erro: Error) => this.erro.set(erro.message) }); }
}
