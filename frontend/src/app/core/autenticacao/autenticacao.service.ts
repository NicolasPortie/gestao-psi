import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';

import { API_URL_BASE } from '../api/api.config';
import { RespostaApi } from '../api/resposta-api.model';
import {
  AutenticacaoResponse,
  CriarContaRequest,
  LoginRequest,
  SolicitarRecuperacaoSenhaRequest,
} from './autenticacao.model';

@Injectable({ providedIn: 'root' })
export class AutenticacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlBase = inject(API_URL_BASE);
  private renovacaoEmAndamento: Observable<AutenticacaoResponse> | null = null;

  readonly usuarioAtual = signal<AutenticacaoResponse | null>(null);

  obterAccessToken(): string | null {
    return this.usuarioAtual()?.accessToken ?? null;
  }

  login(request: LoginRequest): Observable<AutenticacaoResponse> {
    return this.http
      .post<
        RespostaApi<AutenticacaoResponse>
      >(`${this.apiUrlBase}/autenticacao/login`, request, { withCredentials: true })
      .pipe(
        map((resposta) => this.extrairDados(resposta)),
        tap((autenticacao) => this.usuarioAtual.set(autenticacao)),
        catchError((erro) => this.tratarErro(erro)),
      );
  }

  criarConta(request: CriarContaRequest): Observable<AutenticacaoResponse> {
    return this.http
      .post<
        RespostaApi<AutenticacaoResponse>
      >(`${this.apiUrlBase}/autenticacao/cadastro`, request, { withCredentials: true })
      .pipe(
        map((resposta) => this.extrairDados(resposta)),
        tap((autenticacao) => this.usuarioAtual.set(autenticacao)),
        catchError((erro) => this.tratarErro(erro)),
      );
  }

  renovarToken(): Observable<AutenticacaoResponse> {
    if (this.renovacaoEmAndamento) {
      return this.renovacaoEmAndamento;
    }

    this.renovacaoEmAndamento = this.http
      .post<
        RespostaApi<AutenticacaoResponse>
      >(`${this.apiUrlBase}/autenticacao/token/renovar`, {}, { withCredentials: true })
      .pipe(
        map((resposta) => this.extrairDados(resposta)),
        tap((autenticacao) => this.usuarioAtual.set(autenticacao)),
        catchError((erro) => {
          this.usuarioAtual.set(null);
          return this.tratarErro(erro);
        }),
        finalize(() => (this.renovacaoEmAndamento = null)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.renovacaoEmAndamento;
  }

  restaurarSessao(): Observable<boolean> {
    if (this.obterAccessToken()) {
      return of(true);
    }

    return this.renovarToken().pipe(
      map(() => true),
      catchError(() => of(false)),
    );
  }

  sair(): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrlBase}/autenticacao/sair`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.usuarioAtual.set(null)),
        catchError((erro) => {
          this.usuarioAtual.set(null);
          return this.tratarErro(erro);
        }),
      );
  }

  solicitarRecuperacaoSenha(request: SolicitarRecuperacaoSenhaRequest): Observable<void> {
    return this.http
      .post<
        RespostaApi<object>
      >(`${this.apiUrlBase}/autenticacao/recuperacao-senha/solicitar`, request)
      .pipe(
        map(() => undefined),
        catchError((erro) => this.tratarErro(erro)),
      );
  }

  private extrairDados<T>(resposta: RespostaApi<T>): T {
    if (!resposta.sucesso || !resposta.dados) {
      throw new Error(resposta.mensagem ?? 'Nao foi possivel concluir a operacao.');
    }

    return resposta.dados;
  }

  private tratarErro(erro: unknown): Observable<never> {
    if (erro instanceof HttpErrorResponse) {
      const resposta = erro.error as Partial<RespostaApi<unknown>> | null;
      const mensagem =
        resposta?.erros?.[0] ??
        resposta?.mensagem ??
        'Nao foi possivel concluir a operacao. Tente novamente.';

      return throwError(() => new Error(mensagem));
    }

    if (erro instanceof Error) {
      return throwError(() => erro);
    }

    return throwError(() => new Error('Nao foi possivel concluir a operacao. Tente novamente.'));
  }
}
