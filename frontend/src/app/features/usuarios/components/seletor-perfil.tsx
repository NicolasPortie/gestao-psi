import { useQuery } from '@tanstack/react-query';

import { Selecao } from '../../../components/ui/campo';
import { opcoesPerfilFixo } from '../../../core/dominio/perfil';
import {
  listarPerfisAcesso,
  listarPermissoes,
  perfisAcessoKeys,
} from '../../perfis-acesso/perfis-acesso.api';
import { prefixoPerfilPersonalizado as PREFIXO, type EscolhaPerfil } from '../perfil-escolha';

const resumoFixo: Record<string, string> = {
  Recepcionista:
    'Agenda, pacientes, financeiro, conversas, lembretes e relatórios. Sem auditoria, equipe nem conexão do WhatsApp.',
  Administrador:
    'Toda a rotina administrativa, inclusive equipe, auditoria e conexão do WhatsApp. Nunca o conteúdo clínico.',
};

interface SeletorPerfilProps {
  valor: EscolhaPerfil;
  aoMudar: (valor: EscolhaPerfil) => void;
  id?: string;
}

export function SeletorPerfil({ valor, aoMudar, id }: SeletorPerfilProps) {
  const perfisQuery = useQuery({
    queryKey: perfisAcessoKeys.lista(),
    queryFn: ({ signal }) => listarPerfisAcesso({ signal }),
  });
  const catalogoQuery = useQuery({
    queryKey: perfisAcessoKeys.catalogo(),
    queryFn: ({ signal }) => listarPermissoes({ signal }),
    staleTime: Infinity,
  });
  const perfis = perfisQuery.data ?? [];
  const rotulos = new Map((catalogoQuery.data ?? []).map((item) => [item.valor, item.rotulo]));
  const escolhido = valor.startsWith(PREFIXO)
    ? perfis.find((perfil) => `${PREFIXO}${perfil.id}` === valor)
    : undefined;
  const resumo = escolhido
    ? `Pode abrir: ${escolhido.permissoes.map((permissao) => rotulos.get(permissao) ?? permissao).join(', ')}.`
    : resumoFixo[valor];

  return (
    <div className="grid gap-1.5">
      <Selecao id={id} value={valor} onChange={(evento) => aoMudar(evento.target.value)}>
        <optgroup label="Perfis do sistema">
          {opcoesPerfilFixo.map((opcao) => (
            <option key={opcao.valor} value={opcao.valor}>
              {opcao.rotulo}
            </option>
          ))}
        </optgroup>
        {perfis.length > 0 ? (
          <optgroup label="Perfis da sua conta">
            {perfis.map((perfil) => (
              <option key={perfil.id} value={`${PREFIXO}${perfil.id}`}>
                {perfil.nome}
              </option>
            ))}
          </optgroup>
        ) : null}
      </Selecao>
      {resumo ? <p className="text-sm text-ink-muted">{resumo}</p> : null}
    </div>
  );
}
