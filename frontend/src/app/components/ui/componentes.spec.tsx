import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { descreverEstado, paraOpcoes, rotuloDe } from '../../core/dominio/estado';
import { estadosConsulta } from '../../features/agenda/agenda.rotulos';
import { Botao } from './botao';
import { Campo, Entrada, GrupoSegmentado, OpcaoMarcavel, Selecao } from './campo';
import { Confirmacao } from './dialogo';
import { EstadoRotulado } from './marca-estado';

describe('Campo', () => {
  it('liga rótulo, dica e erro ao controle para leitores de tela', () => {
    render(
      <Campo rotulo="E-mail" dica="Usado para entrar." erro="Informe um e-mail válido.">
        <Entrada />
      </Campo>,
    );

    const campo = screen.getByLabelText('E-mail');
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Usado para entrar. Informe um e-mail válido.');
    expect(screen.getByRole('alert')).toHaveTextContent('Informe um e-mail válido.');
  });

  it('marca campos opcionais no próprio rótulo', () => {
    render(
      <Campo rotulo="Telefone" opcional>
        <Entrada />
      </Campo>,
    );
    expect(screen.getByLabelText(/Telefone/)).toBeVisible();
    expect(screen.getByText('(opcional)')).toBeVisible();
  });

  it('seleção nativa expõe as opções e o placeholder', async () => {
    render(
      <Campo rotulo="Modalidade">
        <Selecao placeholder="Selecione…" opcoes={paraOpcoes({ Online: 'Online', Hibrido: 'Híbrido' })} />
      </Campo>,
    );
    await userEvent.selectOptions(screen.getByLabelText('Modalidade'), 'Híbrido');
    expect(screen.getByLabelText('Modalidade')).toHaveValue('Hibrido');
  });
});

describe('OpcaoMarcavel', () => {
  it('interruptor tem papel switch e muda ao clicar no rótulo', async () => {
    render(<OpcaoMarcavel tipo="interruptor" rotulo="Lembretes automáticos" descricao="Enviados 24 h antes." />);
    const interruptor = screen.getByRole('switch', { name: /Lembretes automáticos/ });
    expect(interruptor).not.toBeChecked();
    await userEvent.click(screen.getByText('Lembretes automáticos'));
    expect(interruptor).toBeChecked();
    expect(interruptor).toHaveAccessibleDescription('Enviados 24 h antes.');
  });
});

describe('GrupoSegmentado', () => {
  function Exemplo({ aoMudar }: { aoMudar: (valor: string) => void }) {
    const [valor, setValor] = useState('Presencial');
    return (
      <GrupoSegmentado
        rotulo="Modalidade"
        valor={valor}
        aoMudar={(proximo) => {
          setValor(proximo);
          aoMudar(proximo);
        }}
        opcoes={[
          { valor: 'Presencial', rotulo: 'Presencial' },
          { valor: 'Online', rotulo: 'Online', contagem: 4 },
        ]}
      />
    );
  }

  it('é um grupo de rádio nomeado com uma única opção marcada', async () => {
    const aoMudar = vi.fn();
    render(<Exemplo aoMudar={aoMudar} />);

    expect(screen.getByRole('radiogroup', { name: 'Modalidade' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Presencial' })).toBeChecked();

    await userEvent.click(screen.getByRole('radio', { name: /Online/ }));
    expect(aoMudar).toHaveBeenCalledWith('Online');
    expect(screen.getByRole('radio', { name: /Online/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Presencial' })).not.toBeChecked();
  });
});

describe('EstadoRotulado', () => {
  it('sempre acompanha a marca de um texto legível', () => {
    render(<EstadoRotulado estado={descreverEstado(estadosConsulta, 'AguardandoConfirmacao')} />);
    expect(screen.getByText('Aguardando confirmação')).toBeVisible();
  });

  it('cai para um estado neutro quando o valor é desconhecido', () => {
    expect(descreverEstado(estadosConsulta, 'NovoStatus')).toEqual({ rotulo: 'NovoStatus', tom: 'neutro', marca: 'anel' });
    expect(rotuloDe({ A: 'Alfa' }, 'B')).toBe('B');
  });
});

describe('Botao', () => {
  it('em carregamento fica desabilitado e anuncia ocupado, sem trocar o texto', () => {
    render(<Botao carregando>Salvar</Botao>);
    const botao = screen.getByRole('button', { name: 'Salvar' });
    expect(botao).toBeDisabled();
    expect(botao).toHaveAttribute('aria-busy', 'true');
  });

  it('é do tipo button por padrão, para não enviar formulários sem querer', () => {
    render(<Botao>Cancelar</Botao>);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button');
  });
});

describe('Confirmacao', () => {
  it('pede confirmação explícita e permite desistir', async () => {
    const aoConfirmar = vi.fn();
    const aoMudar = vi.fn();
    render(
      <Confirmacao
        aberto
        aoMudar={aoMudar}
        titulo="Cancelar esta consulta?"
        descricao="O horário ficará livre."
        rotuloConfirmar="Cancelar consulta"
        rotuloCancelar="Manter consulta"
        perigoso
        aoConfirmar={aoConfirmar}
      />,
    );

    expect(await screen.findByRole('alertdialog', { name: 'Cancelar esta consulta?' })).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar consulta' }));
    expect(aoConfirmar).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Manter consulta' }));
    expect(aoMudar).toHaveBeenCalledWith(false, expect.anything());
  });
});
