import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { LayoutAutenticacao } from '../../../../shared/components/layout-autenticacao/layout-autenticacao';

interface FormularioLogin {
  email: FormControl<string>;
  senha: FormControl<string>;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, LayoutAutenticacao],
  templateUrl: './login.html',
})
export class Login {
  private readonly autenticacaoService = inject(AutenticacaoService);

  protected readonly senhaVisivel = signal(false);
  protected readonly enviando = signal(false);
  protected readonly mensagem = signal('');

  protected readonly formulario = new FormGroup<FormularioLogin>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    senha: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected alternarVisibilidadeSenha(): void {
    this.senhaVisivel.update((visivel) => !visivel);
  }

  protected entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagem.set('Informe um e-mail valido e sua senha.');
      return;
    }

    this.enviando.set(true);
    this.mensagem.set('');

    this.autenticacaoService
      .login(this.formulario.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.mensagem.set('Login realizado com sucesso.'),
        error: (erro: Error) => this.mensagem.set(erro.message),
      });
  }
}
