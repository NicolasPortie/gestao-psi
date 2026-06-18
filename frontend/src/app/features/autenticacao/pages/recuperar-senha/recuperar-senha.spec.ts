import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RecuperarSenha } from './recuperar-senha';

describe('RecuperarSenha', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecuperarSenha],
      providers: [provideRouter([])],
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
