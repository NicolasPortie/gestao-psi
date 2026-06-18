import { Component, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';

interface FormularioLogin {
  email: FormControl<string>;
  senha: FormControl<string>;
}

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule],
  templateUrl: './login.html',
})
export class Login {
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
      this.mensagem.set('Informe um e-mail válido e sua senha.');
      return;
    }

    this.enviando.set(true);
    this.mensagem.set('');

    window.setTimeout(() => {
      this.enviando.set(false);
      this.mensagem.set(
        'Acesso validado. A integração com a API será conectada em seguida.',
      );
    }, 650);
  }
}
