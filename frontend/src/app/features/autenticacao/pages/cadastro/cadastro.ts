import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs';
import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { LayoutAutenticacao } from '../../../../shared/components/layout-autenticacao/layout-autenticacao';

interface FormularioCadastro {
  nomeCompleto: FormControl<string>;
  email: FormControl<string>;
  crp: FormControl<string>;
  senha: FormControl<string>;
  confirmarSenha: FormControl<string>;
  aceitouTermos: FormControl<boolean>;
}

type CampoCadastro = keyof FormularioCadastro;

function senhasIguais(controle: AbstractControl): ValidationErrors | null {
  const senha = controle.get('senha')?.value;
  const confirmacao = controle.get('confirmarSenha')?.value;
  return senha === confirmacao ? null : { senhasDiferentes: true };
}

@Component({
  selector: 'app-cadastro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CheckboxModule,
    LayoutAutenticacao,
  ],
  templateUrl: './cadastro.html',
})
export class Cadastro {
  private readonly autenticacaoService = inject(AutenticacaoService);
  private readonly router = inject(Router);

  protected readonly senhaVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly concluido = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly formulario = new FormGroup<FormularioCadastro>(
    {
      nomeCompleto: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      crp: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{2}\/\d{4,6}$/)],
      }),
      senha: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmarSenha: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      aceitouTermos: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: senhasIguais },
  );

  protected alternarVisibilidadeSenha(): void {
    this.senhaVisivel.update((visivel) => !visivel);
  }

  protected formatarCrp(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const digitos = input.value.replace(/\D/g, '').slice(0, 8);
    const valorFormatado =
      digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;

    input.value = valorFormatado;
    this.formulario.controls.crp.setValue(valorFormatado, { emitEvent: false });
  }

  protected campoInvalido(campo: CampoCadastro): boolean {
    const controle = this.formulario.controls[campo];
    return controle.invalid && (controle.touched || controle.dirty);
  }

  protected senhasDiferentes(): boolean {
    const confirmarSenha = this.formulario.controls.confirmarSenha;
    return (
      this.formulario.hasError('senhasDiferentes') &&
      (confirmarSenha.touched || confirmarSenha.dirty)
    );
  }

  protected criarConta(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagemErro.set(
        'Revise os campos destacados para criar sua conta.',
      );
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');

    const { confirmarSenha: _, ...request } = this.formulario.getRawValue();

    this.autenticacaoService
      .criarConta(request)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.concluido.set(true);
          void this.router.navigate(['/painel']);
        },
        error: (erro: Error) => this.mensagemErro.set(erro.message),
      });
  }
}
