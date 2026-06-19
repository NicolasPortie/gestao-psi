import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { API_URL_BASE } from '../../../core/api/api.config';
import { RespostaApi } from '../../../core/api/resposta-api.model';
import { PainelResumo } from '../models/painel.model';

@Injectable({ providedIn: 'root' })
export class PainelService {
  private readonly http = inject(HttpClient);
  private readonly apiUrlBase = inject(API_URL_BASE);

  obterResumo(): Observable<PainelResumo> {
    return this.http
      .get<RespostaApi<PainelResumo>>(`${this.apiUrlBase}/painel/resumo`, {
        withCredentials: true,
      })
      .pipe(
        map((resposta) => {
          if (!resposta.sucesso || !resposta.dados) {
            throw new Error(resposta.mensagem ?? 'Nao foi possivel carregar o painel.');
          }

          return resposta.dados;
        }),
      );
  }
}
