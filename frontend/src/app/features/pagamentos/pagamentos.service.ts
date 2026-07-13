import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URL_BASE } from '../../core/api/api.config';
import { RespostaApi } from '../../core/api/resposta-api.model';

export interface Pagamento { id: string; pacienteId: string; paciente: string; valor: number; status: 'Pendente' | 'Pago' | 'Cancelado' | 'Reembolsado'; formaPagamento: string; vencimentoEm?: string; pagoEm?: string; observacao?: string; }
export interface CriarPagamento { pacienteId: string; valor: number; formaPagamento: string; vencimentoEm?: string; observacao?: string; }

@Injectable({ providedIn: 'root' })
export class PagamentosService {
  private readonly http = inject(HttpClient); private readonly base = inject(API_URL_BASE);
  listar(): Observable<Pagamento[]> { return this.http.get<RespostaApi<Pagamento[]>>(`${this.base}/pagamentos`, { withCredentials: true }).pipe(map((r) => this.dados(r, 'Não foi possível carregar os pagamentos.'))); }
  criar(request: CriarPagamento): Observable<Pagamento> { return this.http.post<RespostaApi<Pagamento>>(`${this.base}/pagamentos`, request, { withCredentials: true }).pipe(map((r) => this.dados(r, 'Não foi possível registrar o pagamento.'))); }
  marcarComoPago(id: string): Observable<Pagamento> { return this.http.patch<RespostaApi<Pagamento>>(`${this.base}/pagamentos/${id}/status`, { status: 'Pago' }, { withCredentials: true }).pipe(map((r) => this.dados(r, 'Não foi possível atualizar o pagamento.'))); }
  private dados<T>(resposta: RespostaApi<T>, padrao: string): T { if (!resposta.sucesso || !resposta.dados) throw new Error(resposta.mensagem ?? padrao); return resposta.dados; }
}
