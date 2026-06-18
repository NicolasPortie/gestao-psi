import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { API_URL_BASE } from '../../../../core/api/api.config';
import { RecuperarSenha } from './recuperar-senha';

describe('RecuperarSenha', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperarSenha],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: API_URL_BASE, useValue: 'http://localhost:5178/api/v1' },
      ],
    }).compileComponents();
  });

  it('deve renderizar o formulario de recuperacao', async () => {
    const fixture = TestBed.createComponent(RecuperarSenha);
    await fixture.whenStable();

    const elemento = fixture.nativeElement as HTMLElement;
    expect(elemento.querySelector('h1')?.textContent).toContain('Recuperar Acesso');
    expect(elemento.querySelector('input[type="email"]')).toBeTruthy();
  });
});
