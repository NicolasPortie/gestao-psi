import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Cadastro } from './cadastro';

describe('Cadastro', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [provideRouter([])],
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
