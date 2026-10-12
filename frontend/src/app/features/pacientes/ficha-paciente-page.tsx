import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, FileHeart, Pencil, UserCheck, UserMinus } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro } from '../../components/feedback/estados';
import { notificar } from '../../components/feedback/notificar';
import { CabecalhoPagina, Pagina, Secao } from '../../components/layout/pagina';
import { Avatar } from '../../components/ui/avatar';
import { BotaoLink } from '../../components/ui/botao';
import { Confirmacao } from '../../components/ui/dialogo';
import { Dado, Ficha } from '../../components/ui/lista';
import { EstadoRotulado } from '../../components/ui/marca-estado';
import { MenuAcoes, type ItemMenu } from '../../components/ui/menu';
import { usePermissoes } from '../../core/autenticacao/permissoes';
import { rotuloDe } from '../../core/dominio/estado';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { formatarData, formatarDataHora, paraCampoData } from '../../core/formatacao/datas';
import { formatarTelefone, textoOuPadrao } from '../../core/formatacao/pessoas';
import { painelKeys } from '../painel/painel.api';
import { ativarPaciente, inativarPaciente, obterPacientePorId } from './pacientes.api';
import { pacientesKeys } from './pacientes.keys';
import { estadosPaciente, rotulosTipoContato } from './pacientes.rotulos';

/** Idade completa em anos, só para exibição ao lado da data de nascimento. */
function idadeEmAnos(nascimento: string, hoje = new Date()) {
  const data = new Date(nascimento);
  if (Number.isNaN(data.getTime())) return null;
  let idade = hoje.getFullYear() - data.getFullYear();
  const jaFezAniversario = hoje.getMonth() > data.getMonth() || (hoje.getMonth() === data.getMonth() && hoje.getDate() >= data.getDate());
  if (!jaFezAniversario) idade -= 1;
  return idade >= 0 ? idade : null;
}

export default function FichaPacientePage() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const { acessoClinico } = usePermissoes();
  const [confirmandoInativacao, setConfirmandoInativacao] = useState(false);

  const pacienteQuery = useQuery({
    queryKey: pacientesKeys.detalhe(id),
    queryFn: ({ signal }) => obterPacientePorId(id, { signal }),
    enabled: Boolean(id),
  });

  const alterarStatus = useMutation({
    mutationFn: (ativar: boolean) => (ativar ? ativarPaciente(id) : inativarPaciente(id)),
    onSuccess: async (paciente) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: pacientesKeys.todos }),
        queryClient.invalidateQueries({ queryKey: painelKeys.todos }),
      ]);
      notificar.sucesso(paciente.status === 'Ativo' ? 'Paciente ativado.' : 'Paciente inativado.');
      setConfirmandoInativacao(false);
    },
    onError: (erro) => {
      notificar.erro(mensagemDeErro(erro, 'Não foi possível alterar o paciente.'));
      setConfirmandoInativacao(false);
    },
  });

  if (pacienteQuery.isPending) return <CarregandoPagina rotulo="Carregando o paciente…" />;
  if (pacienteQuery.error || !pacienteQuery.data) {
    return (
      <EstadoErro
        titulo="Paciente indisponível"
        mensagem={mensagemDeErro(pacienteQuery.error, 'Não encontramos este paciente.')}
        aoTentarNovamente={() => void pacienteQuery.refetch()}
        acao={
          <BotaoLink to="/pacientes" variante="secundario">
            Voltar aos pacientes
          </BotaoLink>
        }
      />
    );
  }

  const paciente = pacienteQuery.data;
  const idade = paciente.dataNascimento ? idadeEmAnos(paciente.dataNascimento) : null;
  const acoesMenu: ItemMenu[] = [
    ...(acessoClinico ? [{ rotulo: 'Abrir prontuário', icone: <FileHeart size={16} />, para: `/pacientes/${paciente.id}/prontuario` }] : []),
    ...(paciente.status === 'Arquivado'
      ? []
      : paciente.status === 'Ativo'
        ? [{ rotulo: 'Inativar paciente', icone: <UserMinus size={16} />, separador: acessoClinico, aoSelecionar: () => setConfirmandoInativacao(true) }]
        : [{ rotulo: 'Ativar paciente', icone: <UserCheck size={16} />, separador: acessoClinico, aoSelecionar: () => alterarStatus.mutate(true) }]),
  ];

  return (
    <Pagina largura="padrao">
      <CabecalhoPagina
        titulo={paciente.nomeCompleto}
        voltarPara={{ para: '/pacientes', rotulo: 'Pacientes' }}
        meta={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <EstadoRotulado estado={estadosPaciente[paciente.status]} />
            <span className="num text-sm">CPF {paciente.cpfMascarado ?? 'não informado'}</span>
          </span>
        }
        acoes={
          <>
            {acoesMenu.length > 0 ? <MenuAcoes itens={acoesMenu} rotulo="Mais ações do paciente" /> : null}
            <BotaoLink to={`/pacientes/${paciente.id}/editar`} variante="secundario">
              <Pencil size={16} aria-hidden="true" />
              Editar cadastro
            </BotaoLink>
            <BotaoLink to={`/consultas/nova?pacienteId=${paciente.id}`} variante="primario">
              <CalendarPlus size={16} aria-hidden="true" />
              Agendar consulta
            </BotaoLink>
          </>
        }
      />

      <div className="flex items-center gap-4">
        <Avatar nome={paciente.nomeCompleto} tamanho="enorme" />
        <p className="max-w-[60ch] text-base text-ink-muted">
          Cadastro administrativo. Anotações clínicas ficam no prontuário e nunca aparecem em listas ou relatórios administrativos.
        </p>
      </div>

      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-2">
        <Secao titulo="Contato">
          <Ficha colunas={1}>
            <Dado rotulo="WhatsApp">
              <span className="num">{formatarTelefone(paciente.whatsApp) || <span className="text-ink-muted">Não informado</span>}</span>
            </Dado>
            <Dado rotulo="Telefone">
              <span className="num">{formatarTelefone(paciente.telefone) || <span className="text-ink-muted">Não informado</span>}</span>
            </Dado>
            <Dado rotulo="E-mail">{textoOuPadrao(paciente.email, 'Não informado')}</Dado>
            {paciente.contatosAdicionais.map((contato, indice) => (
              <Dado key={contato.id ?? indice} rotulo={`${rotuloDe(rotulosTipoContato, contato.tipoContato)}${contato.principal ? ' · principal' : ''}`}>
                {contato.valor}
              </Dado>
            ))}
          </Ficha>
        </Secao>

        <Secao titulo="Agenda e cadastro">
          <Ficha colunas={1}>
            <Dado rotulo="Próxima consulta">
              {paciente.proximaConsulta ? (
                <Link to={`/agenda?data=${paraCampoData(new Date(paciente.proximaConsulta))}`} className="num font-medium">
                  {formatarDataHora(paciente.proximaConsulta)}
                </Link>
              ) : (
                <span className="text-ink-muted">Nada agendado</span>
              )}
            </Dado>
            <Dado rotulo="Última consulta">
              <span className="num">{formatarDataHora(paciente.ultimaConsulta, 'Sem consulta registrada')}</span>
            </Dado>
            <Dado rotulo="Data de nascimento">
              {paciente.dataNascimento ? (
                <>
                  <span className="num">{formatarData(paciente.dataNascimento)}</span>
                  {idade !== null ? <span className="text-ink-muted"> · {idade} anos</span> : null}
                </>
              ) : (
                <span className="text-ink-muted">Não informada</span>
              )}
            </Dado>
            <Dado rotulo="Cadastrado em">
              <span className="num">{formatarData(paciente.criadoEm)}</span>
            </Dado>
          </Ficha>
        </Secao>
      </div>

      <Secao titulo="Observação administrativa" regua>
        <p className="max-w-[70ch] whitespace-pre-wrap text-base text-ink">
          {paciente.observacaoAdministrativa ?? <span className="text-ink-muted">Sem observação.</span>}
        </p>
      </Secao>

      <Confirmacao
        aberto={confirmandoInativacao}
        aoMudar={setConfirmandoInativacao}
        titulo="Inativar este paciente?"
        descricao={`${paciente.nomeCompleto} deixa de aparecer nas buscas de agendamento. O histórico e o prontuário são preservados e você pode reativar quando quiser.`}
        rotuloConfirmar="Inativar"
        carregando={alterarStatus.isPending}
        aoConfirmar={() => alterarStatus.mutate(false)}
      />
    </Pagina>
  );
}
