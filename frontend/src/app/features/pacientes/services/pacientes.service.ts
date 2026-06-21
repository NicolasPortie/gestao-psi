import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_URL_BASE } from '../../../core/api/api.config';
import { RespostaApi } from '../../../core/api/resposta-api.model';
import {
  AtualizarPacienteRequest,
  ListarPacientesFiltro,
  PacienteDetalhe,
  PacientesListagem,
  SalvarPacienteRequest,
} from '../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlBase = inject(API_URL_BASE);

  listar(filtro: ListarPacientesFiltro = {}): Observable<PacientesListagem> {
    let params = new HttpParams()
      .set('pagina', filtro.pagina ?? 1)
      .set('tamanhoPagina', filtro.tamanhoPagina ?? 20);

    if (filtro.busca?.trim()) {
      params = params.set('busca', filtro.busca.trim());
    }

    if (filtro.status) {
      params = params.set('status', filtro.status);
    }

    return this.http
      .get<RespostaApi<PacientesListagem>>(`${this.apiUrlBase}/pacientes`, {
        params,
        withCredentials: true,
      })
      .pipe(map((resposta) => this.extrairDados(resposta, 'Nao foi possivel listar pacientes.')));
  }

  obterPorId(id: string): Observable<PacienteDetalhe> {
    return this.http
      .get<RespostaApi<PacienteDetalhe>>(`${this.apiUrlBase}/pacientes/${id}`, {
        withCredentials: true,
      })
      .pipe(map((resposta) => this.extrairDados(resposta, 'Paciente nao encontrado.')));
  }

  criar(request: SalvarPacienteRequest): Observable<PacienteDetalhe> {
    return this.http
      .post<RespostaApi<PacienteDetalhe>>(`${this.apiUrlBase}/pacientes`, request, {
        withCredentials: true,
      })
      .pipe(map((resposta) => this.extrairDados(resposta, 'Nao foi possivel cadastrar o paciente.')));
  }

  atualizar(id: string, request: AtualizarPacienteRequest): Observable<PacienteDetalhe> {
    return this.http
      .put<RespostaApi<PacienteDetalhe>>(`${this.apiUrlBase}/pacientes/${id}`, request, {
        withCredentials: true,
      })
      .pipe(map((resposta) => this.extrairDados(resposta, 'Nao foi possivel atualizar o paciente.')));
  }

  ativar(id: string): Observable<PacienteDetalhe> {
    return this.alterarStatus(id, 'ativar');
  }

  inativar(id: string): Observable<PacienteDetalhe> {
    return this.alterarStatus(id, 'inativar');
  }

  private alterarStatus(id: string, acao: 'ativar' | 'inativar'): Observable<PacienteDetalhe> {
    return this.http
      .patch<RespostaApi<PacienteDetalhe>>(`${this.apiUrlBase}/pacientes/${id}/${acao}`, null, {
        withCredentials: true,
      })
      .pipe(map((resposta) => this.extrairDados(resposta, 'Nao foi possivel alterar o paciente.')));
  }

  private extrairDados<T>(resposta: RespostaApi<T>, mensagemPadrao: string): T {
    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem ?? mensagemPadrao);
    }

    return resposta.dados;
  }
}
