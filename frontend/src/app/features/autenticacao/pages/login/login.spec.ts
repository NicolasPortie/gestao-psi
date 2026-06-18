import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('deve renderizar o formulario reativo de login', async () => {
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('h1')?.textContent).toContain(
      'Seu consultório digital',
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

    expect(componente.mensagem()).toContain('e-mail válido');
  });
});
