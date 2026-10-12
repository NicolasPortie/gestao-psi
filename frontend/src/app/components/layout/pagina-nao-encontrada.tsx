import { Compass } from 'lucide-react';

import { EstadoVazio } from '../feedback/estados';
import { BotaoLink } from '../ui/botao';

/** Endereço inexistente dentro da área autenticada. Visitantes sem sessão são levados ao login antes de chegar aqui. */
export function PaginaNaoEncontrada() {
  return (
    <EstadoVazio
      icone={Compass}
      titulo="Página não encontrada"
      descricao="O endereço não existe ou foi movido. Volte para o seu dia e continue de lá."
      acao={
        <BotaoLink to="/painel" variante="primario">
          Ir para Hoje
        </BotaoLink>
      }
    />
  );
}
