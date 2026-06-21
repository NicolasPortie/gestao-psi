import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { API_URL_BASE } from '../api/api.config';
import { AutenticacaoResponse } from './autenticacao.model';
import { AutenticacaoService } from './autenticacao.service';

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  let http: HttpTestingController;

  const autenticacao: AutenticacaoResponse = {
    accessToken: 'access-token-teste',
    expiraEm: '2026-06-19T20:00:00Z',
    usuario: {
      id: '7ec48c0e-6ca5-46a0-a49d-20aa94f80c46',
      nomeCompleto: 'Dra. Marina Campos',
      email: 'marina@gestaopsi.local',
      perfil: 'Psicologo',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL_BASE, useValue: '/api/v1' },
      ],
    });

    service = TestBed.inject(AutenticacaoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve compartilhar uma unica renovacao entre chamadas simultaneas', async () => {
    const primeiraRenovacao = firstValueFrom(service.renovarToken());
    const segundaRenovacao = firstValueFrom(service.renovarToken());

    const request = http.expectOne('/api/v1/autenticacao/token/renovar');
    expect(request.request.withCredentials).toBe(true);
    request.flush({ sucesso: true, dados: autenticacao });

    const [primeiraResposta, segundaResposta] = await Promise.all([
      primeiraRenovacao,
      segundaRenovacao,
    ]);

    expect(primeiraResposta).toEqual(autenticacao);
    expect(segundaResposta).toEqual(autenticacao);
    expect(service.usuarioAtual()).toEqual(autenticacao);
  });

  it('deve informar sessao ausente quando o refresh token nao for valido', async () => {
    const restauracao = firstValueFrom(service.restaurarSessao());

    http
      .expectOne('/api/v1/autenticacao/token/renovar')
      .flush(
        { sucesso: false, mensagem: 'Sessao invalida ou expirada.' },
        { status: 401, statusText: 'Unauthorized' },
      );

    await expect(restauracao).resolves.toBe(false);
    expect(service.usuarioAtual()).toBeNull();
  });
});
