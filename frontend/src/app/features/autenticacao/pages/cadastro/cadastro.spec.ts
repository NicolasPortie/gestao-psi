import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_URL_BASE } from '../../../../core/api/api.config';
import { Cadastro } from './cadastro';

describe('Cadastro', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: API_URL_BASE, useValue: 'http://localhost:5178/api/v1' },
      ],
    }).compileComponents();
  });

  it('deve renderizar o formulario de criacao de conta', async () => {
    const fixture = TestBed.createComponent(Cadastro);
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('h1')?.textContent).toContain(
      'Crie seu consultorio digital',
    );
    expect(elemento.querySelector('input[formControlName="crp"]')).toBeTruthy();
  });

  it('deve aplicar mascara no campo CRP ao digitar', async () => {
    const fixture = TestBed.createComponent(Cadastro);
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('#crp') as HTMLInputElement;

    input.value = '06123456';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('06/123456');
  });

  it('deve exibir validacoes ao tentar criar conta incompleta', async () => {
    const fixture = TestBed.createComponent(Cadastro);
    fixture.detectChanges();
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    const botaoCriarConta = Array.from(
      elemento.querySelectorAll<HTMLButtonElement>('button[type="button"]'),
    ).find((botao) => botao.textContent?.includes('Criar minha conta'));

    botaoCriarConta?.click();
    fixture.detectChanges();

    expect(elemento.textContent).toContain('Revise os campos destacados');
    expect(elemento.textContent).toContain('Aceite os termos para continuar');
    expect(elemento.querySelector('.campo-autenticacao-invalido')).toBeTruthy();
  });
});
