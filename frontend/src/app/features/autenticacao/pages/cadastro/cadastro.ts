import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
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

  protected criarConta(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagemErro.set('Revise os dados obrigatorios para criar sua conta.');
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');

    const { confirmarSenha: _, ...request } = this.formulario.getRawValue();

    this.autenticacaoService
      .criarConta(request)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.concluido.set(true),
        error: (erro: Error) => this.mensagemErro.set(erro.message),
      });
  }
}
