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

interface FormularioRecuperacao {
  email: FormControl<string>;
}

@Component({
  selector: 'app-recuperar-senha',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, LayoutAutenticacao],
  templateUrl: './recuperar-senha.html',
})
export class RecuperarSenha {
  private readonly autenticacaoService = inject(AutenticacaoService);

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly mensagemErro = signal('');

  protected readonly formulario = new FormGroup<FormularioRecuperacao>({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  protected enviarLink(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.mensagemErro.set('Informe um e-mail valido.');
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');

    this.autenticacaoService
      .solicitarRecuperacaoSenha(this.formulario.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => this.enviado.set(true),
        error: (erro: Error) => this.mensagemErro.set(erro.message),
      });
  }
}
