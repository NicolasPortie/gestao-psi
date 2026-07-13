import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_URL_BASE } from '../../core/api/api.config';
import { RespostaApi } from '../../core/api/resposta-api.model';

export interface EvolucaoProntuario {
  id: string;
  pacienteId: string;
  tipo: string;
  conteudo: string;
  dataEvolucao: string;
}

@Injectable({ providedIn: 'root' })
export class SessoesService {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_URL_BASE);

  listarEvolucoes(pacienteId: string): Observable<EvolucaoProntuario[]> {
    return this.http
      .get<RespostaApi<EvolucaoProntuario[]>>(`${this.base}/sessoes/evolucoes/${pacienteId}`, { withCredentials: true })
      .pipe(map((resposta) => this.dados(resposta, 'Não foi possível carregar o prontuário.')));
  }

  criarRegistro(request: { consultaId: string; observacoesClinicas?: string; evolucao?: string; encaminhamentos?: string; proximaSessaoSugeridaEm?: string }): Observable<void> {
    return this.http
      .post<RespostaApi<object>>(`${this.base}/sessoes`, request, { withCredentials: true })
      .pipe(map((resposta) => { this.dados(resposta, 'Não foi possível registrar a sessão.'); }));
  }

  criarEvolucao(request: { pacienteId: string; tipo: string; conteudo: string; dataEvolucao: string }): Observable<EvolucaoProntuario> {
    return this.http
      .post<RespostaApi<EvolucaoProntuario>>(`${this.base}/sessoes/evolucoes`, request, { withCredentials: true })
      .pipe(map((resposta) => this.dados(resposta, 'Não foi possível registrar a evolução.')));
  }

  private dados<T>(resposta: RespostaApi<T>, padrao: string): T {
    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem ?? padrao);
    }
    return resposta.dados;
  }
}
