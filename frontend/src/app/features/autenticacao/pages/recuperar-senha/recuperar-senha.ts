import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
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
      this.mensagemErro.set('Informe um e-mail válido.');
      return;
    }

    this.enviando.set(true);
    this.mensagemErro.set('');

    window.setTimeout(() => {
      this.enviando.set(false);
      this.enviado.set(true);
    }, 650);
  }
}
