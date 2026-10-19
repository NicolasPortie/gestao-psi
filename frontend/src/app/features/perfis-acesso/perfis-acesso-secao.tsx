import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { Botao } from '../../components/ui/botao';
import { Confirmacao } from '../../components/ui/dialogo';
import { Etiqueta } from '../../components/ui/etiqueta';
import { ItemLista, ListaRegulada } from '../../components/ui/lista';
import { MenuAcoes } from '../../components/ui/menu';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { GavetaPerfil } from './components/gaveta-perfil';
import {
  listarPerfisAcesso,
  listarPermissoes,
  perfisAcessoKeys,
  removerPerfilAcesso,
  type PerfilAcesso,
} from './perfis-acesso.api';

/** Perfis criados pela própria conta: um nome e o que quem o recebe pode abrir. */
export function PerfisAcessoSecao() {
  const queryClient = useQueryClient();
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [editando, setEditando] = useState<PerfilAcesso | null>(null);
  const [removendo, setRemovendo] = useState<PerfilAcesso | null>(null);

  const perfisQuery = useQuery({
    queryKey: perfisAcessoKeys.lista(),
    queryFn: ({ signal }) => listarPerfisAcesso({ signal }),
  });
  const catalogoQuery = useQuery({
    queryKey: perfisAcessoKeys.catalogo(),
    queryFn: ({ signal }) => listarPermissoes({ signal }),
    staleTime: Infinity,
  });
  const rotulos = new Map((catalogoQuery.data ?? []).map((item) => [item.valor, item.rotulo]));

  const remover = useMutation({
    mutationFn: (perfil: PerfilAcesso) => removerPerfilAcesso(perfil.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: perfisAcessoKeys.todos });
      notificar.sucesso('Perfil removido.');
      setRemovendo(null);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível remover o perfil.'));
      setRemovendo(null);
    },
  });

  function abrir(perfil: PerfilAcesso | null) {
    setEditando(perfil);
    setGavetaAberta(true);
  }

  const perfis = perfisQuery.data ?? [];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="max-w-2xl text-base text-ink-muted">
          Além de Recepcionista e Administrador, crie perfis com o nome e os acessos que o seu
          consultório precisa. Quem recebe um perfil só vê as páginas que ele libera.
        </p>
        <Botao variante="primario" onClick={() => abrir(null)}>
          <Plus size={16} aria-hidden="true" />
          Novo perfil
        </Botao>
      </div>

      {perfisQuery.isPending ? (
        <EsqueletoLinhas quantidade={3} />
      ) : perfisQuery.error && !perfisQuery.data ? (
        <EstadoErro
          titulo="Perfis indisponíveis"
          mensagem={mensagemDeErro(perfisQuery.error, 'Tente novamente em instantes.')}
          aoTentarNovamente={() => void perfisQuery.refetch()}
          recarregando={perfisQuery.isFetching}
        />
      ) : perfis.length === 0 ? (
        <EstadoVazio
          icone={ShieldCheck}
          titulo="Nenhum perfil criado"
          descricao="Crie um perfil quando Recepcionista e Administrador não servirem, por exemplo para quem só cuida da agenda."
          acao={
            <Botao variante="secundario" onClick={() => abrir(null)}>
              Criar o primeiro perfil
            </Botao>
          }
        />
      ) : (
        <ListaRegulada aria-label="Perfis de acesso">
          {perfis.map((perfil) => (
            <ItemLista
              key={perfil.id}
              className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
            >
              <div className="grid min-w-0 gap-1.5">
                <p className="flex flex-wrap items-baseline gap-x-3 text-base">
                  <span className="font-medium text-ink">{perfil.nome}</span>
                  <span className="text-sm text-ink-muted">
                    {perfil.pessoas === 0
                      ? 'Ninguém com este perfil'
                      : perfil.pessoas === 1
                        ? '1 pessoa'
                        : `${perfil.pessoas} pessoas`}
                  </span>
                </p>
                {perfil.descricao ? (
                  <p className="text-sm text-ink-muted">{perfil.descricao}</p>
                ) : null}
                <ul aria-label={`Acessos de ${perfil.nome}`} className="flex flex-wrap gap-1.5">
                  {perfil.permissoes.map((permissao) => (
                    <li key={permissao}>
                      <Etiqueta>{rotulos.get(permissao) ?? permissao}</Etiqueta>
                    </li>
                  ))}
                </ul>
              </div>
              <MenuAcoes
                rotulo={`Ações do perfil ${perfil.nome}`}
                itens={[
                  { rotulo: 'Editar', aoSelecionar: () => abrir(perfil) },
                  {
                    rotulo: 'Remover…',
                    perigo: true,
                    separador: true,
                    aoSelecionar: () => setRemovendo(perfil),
                  },
                ]}
              />
            </ItemLista>
          ))}
        </ListaRegulada>
      )}

      <GavetaPerfil aberto={gavetaAberta} aoMudar={setGavetaAberta} perfil={editando} />

      <Confirmacao
        aberto={removendo !== null}
        aoMudar={(aberto) => !aberto && setRemovendo(null)}
        titulo="Remover este perfil?"
        descricao={
          removendo
            ? removendo.pessoas > 0
              ? `${removendo.nome} ainda está com ${removendo.pessoas === 1 ? '1 pessoa' : `${removendo.pessoas} pessoas`}. Troque o perfil delas antes de remover.`
              : `O perfil ${removendo.nome} deixa de existir. Isso não afeta ninguém.`
            : ''
        }
        rotuloConfirmar="Remover perfil"
        rotuloCancelar="Voltar"
        perigoso
        carregando={remover.isPending}
        aoConfirmar={() => removendo && remover.mutate(removendo)}
      />
    </div>
  );
}
