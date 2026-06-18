import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
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
      'Crie seu consultório digital',
    );
    expect(elemento.querySelector('input[formControlName="crp"]')).toBeTruthy();
  });
});
