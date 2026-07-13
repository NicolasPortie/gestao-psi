import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AutenticacaoService } from '../../../../core/autenticacao/autenticacao.service';
import { Shell } from '../../../../layout/shell/shell';
import { PacientesService } from '../../../pacientes/services/pacientes.service';
import { PacienteDetalhe } from '../../../pacientes/models/paciente.model';
import { EvolucaoProntuario, SessoesService } from '../../sessoes.service';

@Component({ selector: 'app-prontuario', imports: [DatePipe, ReactiveFormsModule, RouterLink, Shell], templateUrl: './prontuario.html' })
export class Prontuario {
  private readonly route = inject(ActivatedRoute);
  private readonly autenticacao = inject(AutenticacaoService);
  private readonly pacientes = inject(PacientesService);
  private readonly sessoes = inject(SessoesService);

  protected readonly usuario = computed(() => this.autenticacao.usuarioAtual()?.usuario);
  protected readonly paciente = signal<PacienteDetalhe | null>(null);
  protected readonly evolucoes = signal<EvolucaoProntuario[]>([]);
  protected readonly carregando = signal(true);
  protected readonly salvando = signal(false);
  protected readonly erro = signal('');
  protected readonly mensagem = signal('');
  protected readonly formulario = new FormGroup({
    tipo: new FormControl('ObservacaoClinica', { nonNullable: true }),
    conteudo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3), Validators.maxLength(8000)] }),
  });

  constructor() {
    const pacienteId = this.route.snapshot.paramMap.get('id');
    if (!pacienteId) { this.carregando.set(false); this.erro.set('Paciente não encontrado.'); return; }
    this.pacientes.obterPorId(pacienteId).subscribe({ next: (paciente) => this.paciente.set(paciente), error: (erro: Error) => this.erro.set(erro.message) });
    this.sessoes.listarEvolucoes(pacienteId).pipe(finalize(() => this.carregando.set(false))).subscribe({ next: (evolucoes) => this.evolucoes.set(evolucoes), error: (erro: Error) => this.erro.set(erro.message) });
  }

  protected salvar(): void {
    const paciente = this.paciente();
    if (!paciente || this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }
    const valor = this.formulario.getRawValue();
    this.salvando.set(true); this.erro.set(''); this.mensagem.set('');
    this.sessoes.criarEvolucao({ pacienteId: paciente.id, tipo: valor.tipo, conteudo: valor.conteudo.trim(), dataEvolucao: new Date().toISOString() }).pipe(finalize(() => this.salvando.set(false))).subscribe({
      next: (evolucao) => { this.evolucoes.update((itens) => [evolucao, ...itens]); this.formulario.reset({ tipo: 'ObservacaoClinica', conteudo: '' }); this.mensagem.set('Evolução registrada no prontuário.'); },
      error: (erro: Error) => this.erro.set(erro.message),
    });
  }

  protected rotuloTipo(tipo: string): string { return tipo.replace(/([A-Z])/g, ' $1').trim(); }
}
