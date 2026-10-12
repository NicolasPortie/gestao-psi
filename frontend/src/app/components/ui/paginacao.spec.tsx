import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { paginasVisiveis } from '../../core/api/paginacao';
import { Paginacao } from './paginacao';

afterEach(() => {
  cleanup();
});

describe('paginasVisiveis', () => {
  it('lista todas quando ha poucas paginas', () => {
    expect(paginasVisiveis(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('usa reticencias nas extremidades quando ha muitas paginas', () => {
    expect(paginasVisiveis(1, 20)).toEqual([1, 2, 'reticencias-inicio', 19, 20]);
    expect(paginasVisiveis(10, 20)).toEqual([
      1,
      2,
      'reticencias-inicio',
      9,
      10,
      11,
      'reticencias-fim',
      19,
      20,
    ]);
  });
});

describe('Paginacao', () => {
  it('exibe intervalo, pagina atual e navega para a proxima', () => {
    const aoMudarPagina = vi.fn();
    render(
      <Paginacao pagina={1} total={95} tamanhoPagina={20} aoMudarPagina={aoMudarPagina} />,
    );

    expect(screen.getByText('Mostrando 1–20 de 95')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ir para a página 1' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Primeira página' })).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(aoMudarPagina).toHaveBeenCalledWith(2);
  });

  it('desabilita avancar na ultima pagina e altera o tamanho', () => {
    const aoMudarPagina = vi.fn();
    const aoMudarTamanhoPagina = vi.fn();
    render(
      <Paginacao
        pagina={5}
        total={95}
        tamanhoPagina={20}
        aoMudarPagina={aoMudarPagina}
        aoMudarTamanhoPagina={aoMudarTamanhoPagina}
      />,
    );

    expect(screen.getByRole('button', { name: 'Próxima página' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Última página' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Itens por página'), { target: { value: '50' } });
    expect(aoMudarTamanhoPagina).toHaveBeenCalledWith(50);
  });

  it('nao renderiza nada sem registros', () => {
    const { container } = render(
      <Paginacao pagina={1} total={0} tamanhoPagina={20} aoMudarPagina={() => {}} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('Paginacao compacta', () => {
  it('exibe apenas pagina atual e anterior/proxima', () => {
    const aoMudarPagina = vi.fn();
    render(
      <Paginacao pagina={2} total={80} tamanhoPagina={20} aoMudarPagina={aoMudarPagina} variante="compacta" />,
    );

    expect(screen.getByText('Página 2 de 4')).toBeVisible();
    expect(screen.queryByRole('button', { name: /Ir para a página/ })).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Itens por página')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(aoMudarPagina).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(aoMudarPagina).toHaveBeenCalledWith(1);
  });

  it('nao renderiza nada em pagina unica', () => {
    const { container } = render(
      <Paginacao pagina={1} total={8} tamanhoPagina={20} aoMudarPagina={() => {}} variante="compacta" />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
