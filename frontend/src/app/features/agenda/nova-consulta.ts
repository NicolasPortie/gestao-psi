import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Shell } from '../../layout/shell/shell';
import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { PacientesService } from '../pacientes/services/pacientes.service';
import { PacienteLista } from '../pacientes/models/paciente.model';
import { AgendaService, TipoAtendimento } from './agenda.service';
@Component({ selector: 'app-nova-consulta', imports: [Shell, RouterLink, ReactiveFormsModule], templateUrl: './nova-consulta.html' })
export class NovaConsulta {
  private readonly agenda = inject(AgendaService); private readonly pacientesService = inject(PacientesService); private readonly autenticacao = inject(AutenticacaoService); private readonly router = inject(Router);
  protected readonly usuario = this.autenticacao.usuarioAtual; protected readonly pacientes = signal<PacienteLista[]>([]); protected readonly tipos = signal<TipoAtendimento[]>([]); protected readonly erro = signal(''); protected readonly salvando = signal(false);
  protected readonly criandoTipo = signal(false); protected readonly tipoCriado = signal('');
  protected readonly form = new FormGroup({ pacienteId: new FormControl('', { nonNullable: true, validators: Validators.required }), tipoAtendimentoId: new FormControl('', { nonNullable: true, validators: Validators.required }), inicio: new FormControl('', { nonNullable: true, validators: Validators.required }), fim: new FormControl('', { nonNullable: true, validators: Validators.required }), modalidade: new FormControl('Presencial', { nonNullable: true }) });
  protected readonly formTipo = new FormGroup({ nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(2)] }), duracaoMinutos: new FormControl(50, { nonNullable: true, validators: [Validators.required, Validators.min(10), Validators.max(240)] }), modalidadePadrao: new FormControl('Presencial', { nonNullable: true }) });
  constructor() { forkJoin({ pacientes: this.pacientesService.listar({ status: 'Ativo', tamanhoPagina: 100 }), tipos: this.agenda.tipos() }).subscribe({ next: ({ pacientes, tipos }) => { this.pacientes.set(pacientes.itens); this.tipos.set(tipos.filter((tipo) => tipo.ativo)); }, error: (erro: Error) => this.erro.set(erro.message) }); }
  protected salvar(): void { if (this.form.invalid) { this.form.markAllAsTouched(); return; } const valor = this.form.getRawValue(); this.salvando.set(true); this.erro.set(''); this.agenda.criarConsulta({ pacienteId: valor.pacienteId, tipoAtendimentoId: valor.tipoAtendimentoId, inicioEm: new Date(valor.inicio).toISOString(), fimEm: new Date(valor.fim).toISOString(), modalidade: valor.modalidade }).pipe(finalize(() => this.salvando.set(false))).subscribe({ next: () => void this.router.navigate(['/agenda']), error: (erro: Error) => this.erro.set(erro.message) }); }
  protected salvarTipo(): void { if (this.formTipo.invalid) { this.formTipo.markAllAsTouched(); return; } this.criandoTipo.set(true); this.erro.set(''); this.tipoCriado.set(''); this.agenda.criarTipo(this.formTipo.getRawValue()).pipe(finalize(() => this.criandoTipo.set(false))).subscribe({ next: (tipo) => { this.tipos.update((tipos) => [...tipos, tipo]); this.form.controls.tipoAtendimentoId.setValue(tipo.id); this.form.controls.modalidade.setValue(tipo.modalidadePadrao); this.tipoCriado.set('Tipo de atendimento criado e selecionado.'); }, error: (erro: Error) => this.erro.set(erro.message) }); }
}
