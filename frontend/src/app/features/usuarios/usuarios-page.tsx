import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, UsersRound } from 'lucide-react';
import { useState } from 'react';

import { EsqueletoLinhas } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Avatar } from '../../components/ui/avatar';
import { Botao } from '../../components/ui/botao';
import { Confirmacao } from '../../components/ui/dialogo';
import { Etiqueta } from '../../components/ui/etiqueta';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { MenuAcoes, type ItemMenu } from '../../components/ui/menu';
import { CabecalhoTabela, CelulaTabela, ColunaTabela, LinhaTabela, Tabela } from '../../components/ui/tabela';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { rotuloPerfil } from '../../core/dominio/perfil';
import { descreverEstado } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarDataHora } from '../../core/formatacao/datas';
import { DialogoEditarUsuario, DialogoSenhaUsuario } from './components/dialogos-usuario';
import { GavetaUsuario } from './components/gaveta-usuario';
import { alterarStatusUsuario, listarUsuarios, usuariosKeys, type StatusUsuario, type Usuario } from './usuarios.api';
import { estadosUsuario } from './usuarios.rotulos';

const mensagensStatus: Record<StatusUsuario, string> = {
  Ativo: 'Usuário ativado.',
  Inativo: 'Usuário inativado.',
  Bloqueado: 'Usuário bloqueado.',
  Pendente: 'Usuário marcado como pendente.',
};

export default function UsuariosPage() {
  const queryClient = useQueryClient();
  const { usuario: logado } = usePermissoes();
  const [criando, setCriando] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [redefinindo, setRedefinindo] = useState<Usuario | null>(null);
  const [mudanca, setMudanca] = useState<{ usuario: Usuario; status: 'Bloqueado' | 'Inativo' } | null>(null);

  const listaQuery = useQuery({ queryKey: usuariosKeys.lista(), queryFn: ({ signal }) => listarUsuarios({ signal }) });

  const alterarStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusUsuario }) => alterarStatusUsuario(id, status),
    onSuccess: async (_resultado, { status }) => {
      await queryClient.invalidateQueries({ queryKey: usuariosKeys.todos });
      notificar.sucesso(mensagensStatus[status]);
      setMudanca(null);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível alterar o usuário.'));
      setMudanca(null);
    },
  });

  const usuarios = listaQuery.data ?? [];

  function acoesDe(usuario: Usuario): ItemMenu[] {
    const proprio = usuario.id === logado?.id;
    return [
      { rotulo: 'Editar dados', aoSelecionar: () => setEditando(usuario) },
      { rotulo: 'Redefinir senha…', aoSelecionar: () => setRedefinindo(usuario) },
      ...(proprio
        ? []
        : [
            ...(usuario.status !== 'Ativo' ? [{ rotulo: 'Ativar', separador: true, aoSelecionar: () => alterarStatus.mutate({ id: usuario.id, status: 'Ativo' }) }] : []),
            ...(usuario.status !== 'Bloqueado' ? [{ rotulo: 'Bloquear acesso…', perigo: true, separador: usuario.status === 'Ativo', aoSelecionar: () => setMudanca({ usuario, status: 'Bloqueado' as const }) }] : []),
            ...(usuario.status !== 'Inativo' ? [{ rotulo: 'Inativar…', perigo: true, aoSelecionar: () => setMudanca({ usuario, status: 'Inativo' as const }) }] : []),
          ]),
    ];
  }

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Equipe"
        descricao="Quem acessa o consultório. Recepcionistas cuidam da rotina administrativa e nunca veem conteúdo clínico."
        acoes={
          <Botao variante="primario" onClick={() => setCriando(true)}>
            <Plus size={16} aria-hidden="true" />
            Novo usuário
          </Botao>
        }
      />

      {listaQuery.isPending ? (
        <EsqueletoLinhas quantidade={4} />
      ) : listaQuery.error && !listaQuery.data ? (
        <EstadoErro titulo="Equipe indisponível" mensagem={mensagemDeErro(listaQuery.error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void listaQuery.refetch()} recarregando={listaQuery.isFetching} />
      ) : usuarios.length === 0 ? (
        <EstadoVazio icone={UsersRound} titulo="Nenhum usuário" descricao="Adicione uma pessoa da recepção para dividir a rotina administrativa." />
      ) : (
        <Tabela rotulo="Equipe do consultório">
          <CabecalhoTabela>
            <tr>
              <ColunaTabela>Pessoa</ColunaTabela>
              <ColunaTabela ocultarAte="sm">Perfil</ColunaTabela>
              <ColunaTabela>Estado</ColunaTabela>
              <ColunaTabela ocultarAte="lg">Último acesso</ColunaTabela>
              <ColunaTabela className="w-px">
                <span className="sr-only">Ações</span>
              </ColunaTabela>
            </tr>
          </CabecalhoTabela>
          <tbody>
            {usuarios.map((usuario) => (
              <LinhaTabela key={usuario.id}>
                <CelulaTabela>
                  <div className="flex items-center gap-3">
                    <Avatar nome={usuario.nomeCompleto} tamanho="grande" />
                    <div className="grid min-w-0">
                      <span className="truncate font-medium text-ink">
                        {usuario.nomeCompleto}
                        {usuario.id === logado?.id ? <span className="ml-2 text-xs font-normal text-ink-muted">(você)</span> : null}
                      </span>
                      <span className="truncate text-sm text-ink-muted">{usuario.email}</span>
                    </div>
                  </div>
                </CelulaTabela>
                <CelulaTabela ocultarAte="sm">
                  <Etiqueta tom={usuario.perfil === 'Psicologo' ? 'acento' : 'neutro'}>{rotuloPerfil(usuario.perfil)}</Etiqueta>
                </CelulaTabela>
                <CelulaTabela>
                  <EstadoRotulado estado={descreverEstado(estadosUsuario, usuario.status)} compacto />
                </CelulaTabela>
                <CelulaTabela ocultarAte="lg" className="num text-ink-muted">
                  {formatarDataHora(usuario.ultimoAcessoEm, 'Nunca acessou')}
                </CelulaTabela>
                <CelulaTabela className="text-right">
                  <MenuAcoes rotulo={`Ações de ${usuario.nomeCompleto}`} itens={acoesDe(usuario)} />
                </CelulaTabela>
              </LinhaTabela>
            ))}
          </tbody>
        </Tabela>
      )}

      <GavetaUsuario aberto={criando} aoMudar={setCriando} />
      <DialogoEditarUsuario usuario={editando} aoFechar={() => setEditando(null)} />
      <DialogoSenhaUsuario usuario={redefinindo} aoFechar={() => setRedefinindo(null)} />

      <Confirmacao
        aberto={mudanca !== null}
        aoMudar={(aberto) => !aberto && setMudanca(null)}
        titulo={mudanca?.status === 'Bloqueado' ? 'Bloquear o acesso?' : 'Inativar este usuário?'}
        descricao={
          mudanca
            ? `${mudanca.usuario.nomeCompleto} ${mudanca.status === 'Bloqueado' ? 'perde o acesso imediatamente' : 'deixa de entrar no sistema'}. Você pode ativar novamente quando quiser.`
            : ''
        }
        rotuloConfirmar={mudanca?.status === 'Bloqueado' ? 'Bloquear acesso' : 'Inativar'}
        rotuloCancelar="Voltar"
        perigoso
        carregando={alterarStatus.isPending}
        aoConfirmar={() => mudanca && alterarStatus.mutate({ id: mudanca.usuario.id, status: mudanca.status })}
      />
    </Pagina>
  );
}
