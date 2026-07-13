import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import { Shell } from '../../layout/shell/shell';
import { AutenticacaoService } from '../../core/autenticacao/autenticacao.service';
import { PacientesService } from '../pacientes/services/pacientes.service';
import { PacienteLista } from '../pacientes/models/paciente.model';
import { AgendaService, TipoAtendimento } from './agenda.service';
@Component({
  selector: 'app-nova-consulta',
  imports: [Shell, RouterLink, ReactiveFormsModule],
  templateUrl: './nova-consulta.html',
})
export class NovaConsulta {
  private readonly agenda = inject(AgendaService);
  private readonly pacientesService = inject(PacientesService);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly usuario = this.autenticacao.usuarioAtual;
  protected readonly pacientes = signal<PacienteLista[]>([]);
  protected readonly tipos = signal<TipoAtendimento[]>([]);
  protected readonly erro = signal('');
  protected readonly salvando = signal(false);
  protected readonly criandoTipo = signal(false);
  protected readonly tipoCriado = signal('');
  protected readonly listaEsperaId = signal(this.route.snapshot.queryParamMap.get('listaEsperaId'));
  protected readonly dataMinima = this.formatarDataLocal(new Date());
  protected readonly form = new FormGroup(
    {
      pacienteId: new FormControl('', { nonNullable: true, validators: Validators.required }),
      tipoAtendimentoId: new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      }),
      inicio: new FormControl('', { nonNullable: true, validators: Validators.required }),
      fim: new FormControl('', { nonNullable: true, validators: Validators.required }),
      modalidade: new FormControl('Presencial', { nonNullable: true }),
    },
    { validators: (controle) => this.validarPeriodo(controle) },
  );
  protected readonly formTipo = new FormGroup({
    nome: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    duracaoMinutos: new FormControl(50, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(10), Validators.max(240)],
    }),
    modalidadePadrao: new FormControl('Presencial', { nonNullable: true }),
  });
  constructor() {
    const pacienteId = this.route.snapshot.queryParamMap.get('pacienteId');
    const tipoAtendimentoId = this.route.snapshot.queryParamMap.get('tipoAtendimentoId');
    forkJoin({
      pacientes: this.pacientesService.listar({ status: 'Ativo', tamanhoPagina: 100 }),
      tipos: this.agenda.tipos(),
    }).subscribe({
      next: ({ pacientes, tipos }) => {
        this.pacientes.set(pacientes.itens);
        this.tipos.set(tipos.filter((tipo) => tipo.ativo));
        if (pacienteId && pacientes.itens.some((paciente) => paciente.id === pacienteId))
          this.form.controls.pacienteId.setValue(pacienteId);
        const tipo = tipos.find((item) => item.id === tipoAtendimentoId && item.ativo);
        if (tipo) {
          this.form.controls.tipoAtendimentoId.setValue(tipo.id);
          this.form.controls.modalidade.setValue(tipo.modalidadePadrao);
        }
      },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }
  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erro.set('Revise os campos destacados para criar a consulta.');
      setTimeout(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const valor = this.form.getRawValue();
    this.salvando.set(true);
    this.erro.set('');
    this.agenda
      .criarConsulta({
        pacienteId: valor.pacienteId,
        tipoAtendimentoId: valor.tipoAtendimentoId,
        listaEsperaId: this.listaEsperaId() ?? undefined,
        inicioEm: new Date(valor.inicio).toISOString(),
        fimEm: new Date(valor.fim).toISOString(),
        modalidade: valor.modalidade,
      })
      .pipe(finalize(() => this.salvando.set(false)))
      .subscribe({
        next: () => void this.router.navigate(['/agenda']),
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }
  protected salvarTipo(): void {
    if (this.formTipo.invalid) {
      this.formTipo.markAllAsTouched();
      return;
    }
    this.criandoTipo.set(true);
    this.erro.set('');
    this.tipoCriado.set('');
    this.agenda
      .criarTipo(this.formTipo.getRawValue())
      .pipe(finalize(() => this.criandoTipo.set(false)))
      .subscribe({
        next: (tipo) => {
          this.tipos.update((tipos) => [...tipos, tipo]);
          this.form.controls.tipoAtendimentoId.setValue(tipo.id);
          this.form.controls.modalidade.setValue(tipo.modalidadePadrao);
          this.tipoCriado.set('Tipo de atendimento criado e selecionado.');
        },
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }
  protected campoInvalido(campo: keyof typeof this.form.controls): boolean {
    const controle = this.form.controls[campo];
    return controle.invalid && (controle.touched || controle.dirty);
  }
  protected periodoInvalido(): boolean {
    return (
      Boolean(this.form.errors?.['periodoInvalido']) &&
      (this.form.controls.fim.touched || this.form.controls.fim.dirty)
    );
  }
  private validarPeriodo(controle: AbstractControl): ValidationErrors | null {
    const inicio = controle.get('inicio')?.value;
    const fim = controle.get('fim')?.value;
    if (!inicio || !fim) return null;
    return new Date(fim) <= new Date(inicio) ? { periodoInvalido: true } : null;
  }
  private formatarDataLocal(data: Date): string {
    const deslocamento = data.getTimezoneOffset() * 60_000;
    return new Date(data.getTime() - deslocamento).toISOString().slice(0, 16);
  }
}
