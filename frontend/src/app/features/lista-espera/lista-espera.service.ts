import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_URL_BASE } from '../../core/api/api.config';
import { RespostaApi } from '../../core/api/resposta-api.model';

export type StatusListaEspera = 'Aguardando' | 'Contatado' | 'Agendado' | 'Cancelado' | 'Expirado';
export type OrigemListaEspera = 'Painel' | 'Recepcionista' | 'Paciente' | 'Outro';
export type DiaSemana = 'Domingo' | 'Segunda' | 'Terca' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sabado';

export interface ItemListaEspera {
  id: string;
  pacienteId: string;
  paciente: string;
  tipoAtendimentoId?: string;
  tipoAtendimento?: string;
  preferenciaDiaSemana?: DiaSemana;
  preferenciaHorarioInicio?: string;
  preferenciaHorarioFim?: string;
  prioridade: number;
  status: StatusListaEspera;
  origem: OrigemListaEspera;
  observacaoAdministrativa?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export interface FiltrosListaEspera {
  status?: StatusListaEspera;
  tipoAtendimentoId?: string;
  prioridade?: number;
  origem?: OrigemListaEspera;
}

export interface CriarItemListaEspera {
  pacienteId: string;
  tipoAtendimentoId?: string;
  preferenciaDiaSemana?: DiaSemana;
  preferenciaHorarioInicio?: string;
  preferenciaHorarioFim?: string;
  prioridade: number;
  observacaoAdministrativa?: string;
}

@Injectable({ providedIn: 'root' })
export class ListaEsperaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL_BASE);

  listar(filtros: FiltrosListaEspera): Observable<ItemListaEspera[]> {
    let params = new HttpParams();
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.tipoAtendimentoId) params = params.set('tipoAtendimentoId', filtros.tipoAtendimentoId);
    if (filtros.prioridade) params = params.set('prioridade', filtros.prioridade);
    if (filtros.origem) params = params.set('origem', filtros.origem);

    return this.http
      .get<RespostaApi<ItemListaEspera[]>>(`${this.apiUrl}/lista-espera`, { params, withCredentials: true })
      .pipe(map((resposta) => this.obterDados(resposta, 'Não foi possível carregar a lista de espera.')));
  }

  criar(request: CriarItemListaEspera): Observable<ItemListaEspera> {
    return this.http
      .post<RespostaApi<ItemListaEspera>>(`${this.apiUrl}/lista-espera`, request, { withCredentials: true })
      .pipe(map((resposta) => this.obterDados(resposta, 'Não foi possível adicionar o paciente à lista.')));
  }

  alterarStatus(id: string, status: Exclude<StatusListaEspera, 'Aguardando' | 'Agendado'>): Observable<ItemListaEspera> {
    return this.http
      .patch<RespostaApi<ItemListaEspera>>(`${this.apiUrl}/lista-espera/${id}/status`, { status }, { withCredentials: true })
      .pipe(map((resposta) => this.obterDados(resposta, 'Não foi possível atualizar a lista de espera.')));
  }

  private obterDados<T>(resposta: RespostaApi<T>, mensagemPadrao: string): T {
    if (!resposta.sucesso || resposta.dados == null) throw new Error(resposta.mensagem ?? mensagemPadrao);
    return resposta.dados;
  }
}
