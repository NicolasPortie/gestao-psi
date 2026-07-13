import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { Shell } from '../../../../layout/shell/shell';
import {
  PacienteDetalhe,
  StatusPaciente,
  TipoContatoPaciente,
} from '../../models/paciente.model';
import { PacientesService } from '../../services/pacientes.service';

interface FormularioContatoAdicional {
  tipoContato: FormControl<TipoContatoPaciente>;
  valor: FormControl<string>;
  principal: FormControl<boolean>;
}

interface FormularioPaciente {
  nomeCompleto: FormControl<string>;
  dataNascimento: FormControl<string>;
  cpf: FormControl<string>;
  telefone: FormControl<string>;
  whatsApp: FormControl<string>;
  email: FormControl<string>;
  status: FormControl<StatusPaciente>;
  observacaoAdministrativa: FormControl<string>;
  contatosAdicionais: FormArray<FormGroup<FormularioContatoAdicional>>;
}

type CampoPaciente = keyof FormularioPaciente;

@Component({
  selector: 'app-formulario-paciente',
  imports: [ReactiveFormsModule, RouterLink, Shell],
  templateUrl: './formulario-paciente.html',
})
export class FormularioPacienteComponent implements OnInit {
  private readonly pacientesService = inject(PacientesService);
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly usuario = computed(
    () => this.autenticacaoService.usuarioAtual()?.usuario,
  );

  protected readonly pacienteId = signal<string | null>(null);
  protected readonly carregando = signal(false);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');

  protected readonly editando = computed(() => Boolean(this.pacienteId()));
  protected readonly tiposContato: TipoContatoPaciente[] = [
    'Telefone',
    'WhatsApp',
    'Email',
    'Responsavel',
  ];

  protected readonly formulario = new FormGroup<FormularioPaciente>({
    nomeCompleto: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
    dataNascimento: new FormControl('', { nonNullable: true }),
    cpf: new FormControl('', { nonNullable: true }),
    telefone: new FormControl('', { nonNullable: true }),
    whatsApp: new FormControl('', { nonNullable: true }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email],
    }),
    status: new FormControl<StatusPaciente>('Ativo', { nonNullable: true }),
    observacaoAdministrativa: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    contatosAdicionais: new FormArray<FormGroup<FormularioContatoAdicional>>([]),
  });

  protected get contatosAdicionais(): FormArray<FormGroup<FormularioContatoAdicional>> {
    return this.formulario.controls.contatosAdicionais;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.pacienteId.set(id);

    if (id) {
      this.carregarPaciente(id);
    }
  }

  protected campoInvalido(campo: CampoPaciente): boolean {
    const controle = this.formulario.controls[campo];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  protected formatarCpf(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);
    input.value = digitos
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
    this.formulario.controls.cpf.setValue(input.value, { emitEvent: false });
  }

  protected formatarTelefone(campo: 'telefone' | 'whatsApp', evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);
    input.value =
      digitos.length > 10
        ? digitos.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
        : digitos.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    this.formulario.controls[campo].setValue(input.value, { emitEvent: false });
  }

  protected formatarContatoAdicional(indice: number, evento: Event): void {
    const contato = this.contatosAdicionais.at(indice);
    const tipo = contato.controls.tipoContato.value;

    if (tipo !== 'Telefone' && tipo !== 'WhatsApp') {
      return;
    }

    const input = evento.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 11);
    input.value =
      digitos.length > 10
        ? digitos.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
        : digitos.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    contato.controls.valor.setValue(input.value, { emitEvent: false });
  }

  protected adicionarContato(): void {
    this.contatosAdicionais.push(this.criarContatoAdicional());
  }

  protected removerContato(indice: number): void {
    this.contatosAdicionais.removeAt(indice);
  }

  protected placeholderContato(tipo: TipoContatoPaciente): string {
    if (tipo === 'Email') {
      return 'contato@email.com';
    }

    if (tipo === 'Responsavel') {
      return 'Nome e telefone do responsavel';
    }

    return '(00) 00000-0000';
  }

  protected salvar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.erro.set('Revise os campos destacados para salvar o paciente.');
      return;
    }

    const valor = this.formulario.getRawValue();
    const request = {
      nomeCompleto: valor.nomeCompleto.trim(),
      dataNascimento: valor.dataNascimento || null,
      cpf: valor.cpf || null,
      telefone: valor.telefone || null,
      whatsApp: valor.whatsApp || null,
      email: valor.email || null,
      observacaoAdministrativa: valor.observacaoAdministrativa || null,
      contatosAdicionais: valor.contatosAdicionais
        .filter((contato) => contato.valor.trim())
        .map((contato) => ({
          tipoContato: contato.tipoContato,
          valor: contato.valor.trim(),
          principal: contato.principal,
        })),
    };

    this.salvando.set(true);
    this.erro.set('');
    this.mensagem.set('');

    const id = this.pacienteId();
    const requisicao = id
      ? this.pacientesService.atualizar(id, {
          ...request,
          status: valor.status,
        })
      : this.pacientesService.criar(request);

    requisicao.pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (paciente) => {
        this.mensagem.set('Paciente salvo com sucesso.');
        void this.router.navigate(['/pacientes', paciente.id], { replaceUrl: true });
      },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  private carregarPaciente(id: string): void {
    this.carregando.set(true);
    this.erro.set('');

    this.pacientesService
      .obterPorId(id)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: (paciente) => this.preencherFormulario(paciente),
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  private preencherFormulario(paciente: PacienteDetalhe): void {
    this.formulario.patchValue({
      nomeCompleto: paciente.nomeCompleto,
      dataNascimento: paciente.dataNascimento ?? '',
      cpf: this.aplicarMascaraCpf(paciente.cpf ?? paciente.cpfMascarado),
      telefone: this.aplicarMascaraTelefone(paciente.telefone),
      whatsApp: this.aplicarMascaraTelefone(paciente.whatsApp),
      email: paciente.email ?? '',
      status: paciente.status,
      observacaoAdministrativa: paciente.observacaoAdministrativa ?? '',
    });

    this.contatosAdicionais.clear();
    for (const contato of paciente.contatosAdicionais ?? []) {
      this.contatosAdicionais.push(
        this.criarContatoAdicional(
          contato.tipoContato,
          contato.tipoContato === 'Telefone' || contato.tipoContato === 'WhatsApp'
            ? this.aplicarMascaraTelefone(contato.valor)
            : contato.valor,
          contato.principal,
        ),
      );
    }
  }

  private criarContatoAdicional(
    tipoContato: TipoContatoPaciente = 'Telefone',
    valor = '',
    principal = false,
  ): FormGroup<FormularioContatoAdicional> {
    return new FormGroup<FormularioContatoAdicional>({
      tipoContato: new FormControl<TipoContatoPaciente>(tipoContato, { nonNullable: true }),
      valor: new FormControl(valor, { nonNullable: true }),
      principal: new FormControl(principal, { nonNullable: true }),
    });
  }

  private aplicarMascaraTelefone(valor: string | null | undefined): string {
    const digitos = valor?.replace(/\D/g, '').slice(0, 11) ?? '';

    if (!digitos) {
      return '';
    }

    return digitos.length > 10
      ? digitos.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3')
      : digitos.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  }

  private aplicarMascaraCpf(valor: string | null | undefined): string {
    const digitos = valor?.replace(/\D/g, '').slice(0, 11) ?? '';

    if (!digitos) {
      return '';
    }

    return digitos.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
  }
}
