import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { API_URL_BASE } from '../../../../core/api/api.config';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: API_URL_BASE, useValue: 'http://localhost:5178/api/v1' },
      ],
    }).compileComponents();
  });

  it('deve renderizar o formulario reativo de login', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('h1')?.textContent).toContain(
      'Seu consultorio digital',
    );
    expect(elemento.querySelector('input[formControlName="email"]')).toBeTruthy();
    expect(elemento.querySelector('button[type="submit"]')?.textContent).toContain(
      'Entrar',
    );
  });

  it('deve rejeitar formulario invalido', () => {
    const fixture = TestBed.createComponent(Login);
    const componente = fixture.componentInstance as unknown as {
      entrar(): void;
      mensagem(): string;
    };

    componente.entrar();

    expect(componente.mensagem()).toContain('e-mail valido');
  });

  it('deve navegar para cadastro pelo botao de criacao de conta', async () => {
    const fixture = TestBed.createComponent(Login);
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const componente = fixture.componentInstance as unknown as {
      navegarParaCadastro(evento?: Event): void;
    };
    const evento = new Event('click');
    const preventDefault = vi.spyOn(evento, 'preventDefault');

    fixture.detectChanges();
    await fixture.whenStable();

    componente.navegarParaCadastro(evento);

    expect(preventDefault).toHaveBeenCalled();
    expect(navegar).toHaveBeenCalledWith(['/cadastro']);
  });
});
