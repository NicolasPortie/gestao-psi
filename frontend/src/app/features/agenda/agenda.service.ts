import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL_BASE } from '../../core/api/api.config';
import { RespostaApi } from '../../core/api/resposta-api.model';

export interface TipoAtendimento { id: string; nome: string; descricao?: string; duracaoMinutos: number; valorPadrao?: number; modalidadePadrao: string; ativo: boolean; }
export interface Consulta { id: string; pacienteId: string; paciente: string; tipoAtendimentoId: string; tipoAtendimento: string; inicioEm: string; fimEm: string; status: string; modalidade: string; }
@Injectable({ providedIn: 'root' })
export class AgendaService {
  private readonly http = inject(HttpClient); private readonly base = inject(API_URL_BASE);
  listar(inicio: string, fim: string): Observable<Consulta[]> { return this.http.get<RespostaApi<Consulta[]>>(`${this.base}/consultas`, { params: new HttpParams().set('inicio', inicio).set('fim', fim), withCredentials: true }).pipe(map((r) => this.dados(r, 'Nao foi possivel carregar a agenda.'))); }
  tipos(): Observable<TipoAtendimento[]> { return this.http.get<RespostaApi<TipoAtendimento[]>>(`${this.base}/agenda/tipos-atendimento`, { withCredentials: true }).pipe(map((r) => this.dados(r, 'Nao foi possivel carregar os tipos de atendimento.'))); }
  criarTipo(request: { nome: string; duracaoMinutos: number; modalidadePadrao: string }): Observable<TipoAtendimento> { return this.http.post<RespostaApi<TipoAtendimento>>(`${this.base}/agenda/tipos-atendimento`, { ...request, ativo: true }, { withCredentials: true }).pipe(map((r) => this.dados(r, 'Nao foi possivel criar o tipo de atendimento.'))); }
  criarConsulta(request: { pacienteId: string; tipoAtendimentoId: string; inicioEm: string; fimEm: string; modalidade: string }): Observable<Consulta> { return this.http.post<RespostaApi<Consulta>>(`${this.base}/consultas`, request, { withCredentials: true }).pipe(map((r) => this.dados(r, 'Nao foi possivel criar a consulta.'))); }
  private dados<T>(r: RespostaApi<T>, padrao: string): T { if (!r.sucesso || !r.dados) throw new Error(r.mensagem ?? padrao); return r.dados; }
}
