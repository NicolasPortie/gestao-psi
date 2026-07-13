import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { AgendaService, Consulta } from '../../../agenda/agenda.service';
import { Shell } from '../../../../layout/shell/shell';
import { SessoesService } from '../../../sessoes/sessoes.service';

@Component({
  selector: 'app-detalhe-consulta',
  imports: [DatePipe, NgClass, ReactiveFormsModule, RouterLink, Shell],
  templateUrl: './detalhe-consulta.html',
})
export class DetalheConsulta {
  private readonly route = inject(ActivatedRoute);
  private readonly agenda = inject(AgendaService);
  private readonly sessoes = inject(SessoesService);
  private readonly autenticacao = inject(AutenticacaoService);

  protected readonly usuario = computed(() => this.autenticacao.usuarioAtual()?.usuario);
  protected readonly consulta = signal<Consulta | null>(null);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly podeRegistrarSessao = computed(() => this.usuario()?.perfil === 'Psicologo');
  protected readonly justificativaCancelamento = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] });
  protected readonly registro = new FormGroup({
    observacoesClinicas: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(8000)] }),
    evolucao: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(8000)] }),
    encaminhamentos: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(4000)] }),
    proximaSessaoSugeridaEm: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.erro.set('Consulta não encontrada.');
      this.carregando.set(false);
      return;
    }
    this.agenda.obterPorId(id).pipe(finalize(() => this.carregando.set(false))).subscribe({
      next: (consulta) => this.consulta.set(consulta),
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected atualizarStatus(status: 'Confirmada' | 'Cancelada' | 'NaoCompareceu'): void {
    const consulta = this.consulta();
    if (!consulta) return;
    if (status === 'Cancelada' && this.justificativaCancelamento.invalid) {
      this.justificativaCancelamento.markAsTouched();
      return;
    }
    this.salvando.set(true); this.erro.set(''); this.mensagem.set('');
    this.agenda.alterarStatus(consulta.id, status, status === 'Cancelada' ? this.justificativaCancelamento.value : undefined)
      .pipe(finalize(() => this.salvando.set(false))).subscribe({
        next: (atualizada) => { this.consulta.set(atualizada); this.mensagem.set('Status atualizado com sucesso.'); },
        error: (erro: Error) => this.erro.set(erro.message),
      });
  }

  protected salvarRegistro(): void {
    const consulta = this.consulta();
    if (!consulta || this.registro.invalid) { this.registro.markAllAsTouched(); return; }
    const valor = this.registro.getRawValue();
    this.salvando.set(true); this.erro.set(''); this.mensagem.set('');
    this.sessoes.criarRegistro({
      consultaId: consulta.id,
      observacoesClinicas: valor.observacoesClinicas || undefined,
      evolucao: valor.evolucao || undefined,
      encaminhamentos: valor.encaminhamentos || undefined,
      proximaSessaoSugeridaEm: valor.proximaSessaoSugeridaEm ? new Date(valor.proximaSessaoSugeridaEm).toISOString() : undefined,
    }).pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: () => { this.mensagem.set('Sessão registrada. O conteúdo clínico foi salvo com acesso restrito.'); this.registro.reset(); this.consulta.update((item) => item ? { ...item, status: 'Realizada' } : item); },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected classeStatus(status: string): string {
    if (status === 'Confirmada' || status === 'Realizada') return 'bg-[#eaf5eb] text-[#28563b]';
    if (status === 'Cancelada' || status === 'NaoCompareceu') return 'bg-[#fff0ed] text-[#a12d24]';
    return 'bg-[#fff8df] text-[#725519]';
  }
}
