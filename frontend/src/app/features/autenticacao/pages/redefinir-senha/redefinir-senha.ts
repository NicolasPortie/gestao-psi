import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { LayoutAutenticacao } from '../../../../shared/components/layout-autenticacao/layout-autenticacao';

@Component({ selector: 'app-redefinir-senha', imports: [ReactiveFormsModule, RouterLink, ButtonModule, LayoutAutenticacao], templateUrl: './redefinir-senha.html' })
export class RedefinirSenha {
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly enviando = signal(false);
  protected readonly erro = signal('');
  protected readonly concluido = signal(false);
  protected readonly formulario = new FormGroup({ senha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }), confirmacao: new FormControl('', { nonNullable: true, validators: [Validators.required] }) });
  protected salvar(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.erro.set('O link de recuperacao e invalido ou expirou.'); return; }
    if (this.formulario.invalid || this.formulario.controls.senha.value !== this.formulario.controls.confirmacao.value) { this.formulario.markAllAsTouched(); this.erro.set('Use uma senha com ao menos 8 caracteres e confirme o mesmo valor.'); return; }
    this.enviando.set(true); this.erro.set('');
    this.autenticacao.redefinirSenha(token, this.formulario.controls.senha.value).pipe(finalize(() => this.enviando.set(false))).subscribe({ next: () => { this.concluido.set(true); setTimeout(() => void this.router.navigate(['/login']), 1200); }, error: (erro: Error) => this.erro.set(erro.message) });
  }
}
