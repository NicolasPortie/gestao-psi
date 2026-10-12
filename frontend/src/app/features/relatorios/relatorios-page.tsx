import { Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ClipboardList, Printer } from 'lucide-react';
import { useRef, useState } from 'react';

import { Aviso } from '../../components/feedback/aviso';
import { CarregandoPagina } from '../../components/feedback/esqueleto';
import { EstadoErro, EstadoVazio } from '../../components/feedback/estados';
import { CabecalhoPagina, Pagina } from '../../components/layout/pagina';
import { Botao } from '../../components/ui/botao';
import { Campo, Entrada, Selecao } from '../../components/ui/campo';
import { mensagemDeErro } from '../../core/erros/mensagem-de-erro';
import { adicionarDias, formatarDataHora, paraCampoData } from '../../core/formatacao/datas';
import { SeletorPaciente } from '../pacientes/components/seletor-paciente';
import { gerarRelatorio, listarCatalogoRelatorios, relatoriosKeys, type RelatorioGerado } from './relatorios.api';

interface Formulario {
  codigo: string;
  inicio: string;
  fim: string;
  pacienteId: string;
}

const inicioDoMes = (referencia: Date) => new Date(referencia.getFullYear(), referencia.getMonth(), 1);

const atalhosPeriodo = [
  { rotulo: 'Este mês', intervalo: () => ({ inicio: inicioDoMes(new Date()), fim: new Date() }) },
  {
    rotulo: 'Mês anterior',
    intervalo: () => {
      const base = new Date();
      return { inicio: new Date(base.getFullYear(), base.getMonth() - 1, 1), fim: new Date(base.getFullYear(), base.getMonth(), 0) };
    },
  },
  { rotulo: 'Últimos 30 dias', intervalo: () => ({ inicio: adicionarDias(new Date(), -29), fim: new Date() }) },
];

export default function RelatoriosPage() {
  const quadroRef = useRef<HTMLIFrameElement>(null);
  const [resultado, setResultado] = useState<RelatorioGerado | null>(null);
  const [erro, setErro] = useState('');

  const { control, register, handleSubmit, setValue } = useForm<Formulario>({
    defaultValues: { codigo: '', inicio: paraCampoData(inicioDoMes(new Date())), fim: paraCampoData(new Date()), pacienteId: '' },
  });

  const catalogoQuery = useQuery({ queryKey: relatoriosKeys.catalogo(), queryFn: ({ signal }) => listarCatalogoRelatorios({ signal }) });
  const catalogo = catalogoQuery.data ?? [];
  const codigo = useWatch({ control, name: 'codigo' });
  const pacienteId = useWatch({ control, name: 'pacienteId' });
  const selecionado = catalogo.find((item) => item.codigo === codigo);

  const gerar = useMutation({
    mutationFn: (valores: Formulario) =>
      gerarRelatorio(valores.codigo, {
        periodoInicio: new Date(`${valores.inicio}T00:00:00`).toISOString(),
        periodoFim: new Date(`${valores.fim}T23:59:59`).toISOString(),
        pacienteId: valores.pacienteId || null,
      }),
    onSuccess: (dados) => {
      setResultado(dados);
      setErro('');
    },
    onError: (falha) => {
      setResultado(null);
      setErro(mensagemDeErro(falha, 'Não foi possível gerar o relatório.'));
    },
  });

  function imprimir() {
    const janela = quadroRef.current?.contentWindow;
    janela?.focus();
    janela?.print();
  }

  if (catalogoQuery.isPending) return <CarregandoPagina rotulo="Carregando os relatórios…" />;
  if (catalogoQuery.error && !catalogoQuery.data) {
    return <EstadoErro titulo="Relatórios indisponíveis" mensagem={mensagemDeErro(catalogoQuery.error, 'Tente novamente em instantes.')} aoTentarNovamente={() => void catalogoQuery.refetch()} />;
  }

  const podeGerar = Boolean(codigo) && !(selecionado?.exigePaciente && !pacienteId);

  return (
    <Pagina largura="ampla" className="gap-6">
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Indicadores oficiais calculados pelo servidor. Esta tela só exibe e imprime o resultado, sem recalcular nada."
      />

      <form className="grid gap-4" noValidate onSubmit={(evento) => void handleSubmit((valores) => gerar.mutate(valores))(evento)}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(9.5rem,0.7fr))] md:items-start">
          <Campo rotulo="Relatório" dica={selecionado?.descricao}>
            <Selecao placeholder="Escolha um relatório…" opcoes={catalogo.map((item) => ({ valor: item.codigo, rotulo: item.nome }))} {...register('codigo')} />
          </Campo>
          <Campo rotulo="De">
            <Entrada type="date" {...register('inicio')} />
          </Campo>
          <Campo rotulo="Até">
            <Entrada type="date" {...register('fim')} />
          </Campo>
        </div>

        {selecionado?.exigePaciente ? (
          <Campo rotulo="Paciente" className="md:max-w-md">
            <Controller control={control} name="pacienteId" render={({ field }) => <SeletorPaciente valor={field.value} aoMudar={field.onChange} status="" />} />
          </Campo>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Botao type="submit" variante="primario" carregando={gerar.isPending} disabled={!podeGerar}>
            <ClipboardList size={16} aria-hidden="true" />
            Gerar relatório
          </Botao>
          <span className="mx-1 hidden h-5 w-px bg-line-strong sm:block" aria-hidden="true" />
          {atalhosPeriodo.map((atalho) => (
            <Botao
              key={atalho.rotulo}
              variante="discreto"
              tamanho="pequeno"
              onClick={() => {
                const { inicio, fim } = atalho.intervalo();
                setValue('inicio', paraCampoData(inicio));
                setValue('fim', paraCampoData(fim));
              }}
            >
              {atalho.rotulo}
            </Botao>
          ))}
        </div>
        {erro ? <Aviso tom="perigo">{erro}</Aviso> : null}
      </form>

      <section aria-label="Resultado" className="min-w-0">
        {resultado ? (
          <div className="grid gap-3 border-t border-line pt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="grid gap-0.5">
                <h2 className="text-lg font-semibold text-ink">{resultado.titulo}</h2>
                <p className="num text-sm text-ink-muted">
                  Gerado em {formatarDataHora(resultado.geradoEm)} · período {formatarDataHora(resultado.periodoInicio)} a {formatarDataHora(resultado.periodoFim)}
                </p>
              </div>
              <Botao variante="secundario" onClick={imprimir}>
                <Printer size={16} aria-hidden="true" />
                Imprimir
              </Botao>
            </div>
            <iframe
              ref={quadroRef}
              title={resultado.titulo}
              className="min-h-[70dvh] w-full rounded-md border border-line-strong bg-white"
              sandbox="allow-modals allow-same-origin"
              srcDoc={resultado.html}
            />
          </div>
        ) : (
          <EstadoVazio
            compacto
            icone={ClipboardList}
            titulo="Nenhum relatório gerado"
            descricao="Escolha o relatório e o período acima. O resultado oficial aparece aqui, pronto para imprimir."
          />
        )}
      </section>
    </Pagina>
  );
}
