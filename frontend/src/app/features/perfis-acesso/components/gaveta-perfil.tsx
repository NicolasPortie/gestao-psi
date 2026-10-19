import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Aviso } from '../../../components/feedback/aviso';
import { notificar } from '../../../components/feedback/notificar';
import { Botao } from '../../../components/ui/botao';
import { AreaTexto, Campo, Entrada, OpcaoMarcavel } from '../../../components/ui/campo';
import { Gaveta } from '../../../components/ui/dialogo';
import { usePermissoes } from '../../../core/autenticacao/permissoes';
import { todasAsPermissoes, type PermissaoAcesso } from '../../../core/dominio/permissao-acesso';
import { mensagemDeErro } from '../../../core/erros/mensagem-de-erro';
import {
  atualizarPerfilAcesso,
  criarPerfilAcesso,
  listarPermissoes,
  perfisAcessoKeys,
  type PerfilAcesso,
} from '../perfis-acesso.api';

const schema = z.object({
  nome: z.string().trim().min(2, 'Dê um nome ao perfil.').max(80, 'Use até 80 caracteres.'),
  descricao: z.string().max(300, 'Use até 300 caracteres.'),
  permissoes: z
    .array(z.enum(todasAsPermissoes as [PermissaoAcesso, ...PermissaoAcesso[]]))
    .min(1, 'Marque pelo menos um acesso.'),
});
type Formulario = z.infer<typeof schema>;
const iniciais: Formulario = { nome: '', descricao: '', permissoes: [] };

interface GavetaPerfilProps {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  /** Perfil em edição; sem ele, a gaveta cria um novo. */
  perfil: PerfilAcesso | null;
}

export function GavetaPerfil({ aberto, aoMudar, perfil }: GavetaPerfilProps) {
  const queryClient = useQueryClient();
  const { pode } = usePermissoes();
  const catalogoQuery = useQuery({
    queryKey: perfisAcessoKeys.catalogo(),
    queryFn: ({ signal }) => listarPermissoes({ signal }),
    enabled: aberto,
    staleTime: Infinity,
  });
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(schema), defaultValues: iniciais });

  const salvar = useMutation({
    mutationFn: (valores: Formulario) => {
      const request = {
        nome: valores.nome.trim(),
        descricao: valores.descricao.trim() || null,
        permissoes: valores.permissoes,
      };
      return perfil ? atualizarPerfilAcesso(perfil.id, request) : criarPerfilAcesso(request);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: perfisAcessoKeys.todos });
      notificar.sucesso(perfil ? 'Perfil salvo.' : 'Perfil criado.');
      aoMudar(false);
    },
  });
  const { reset: limparErro } = salvar;

  useEffect(() => {
    if (!aberto) return;
    reset(
      perfil
        ? { nome: perfil.nome, descricao: perfil.descricao ?? '', permissoes: perfil.permissoes }
        : iniciais,
    );
    limparErro();
  }, [aberto, perfil, reset, limparErro]);

  const marcadas = useWatch({ control, name: 'permissoes' });
  const faltaPacientes = marcadas.includes('Agenda') && !marcadas.includes('Pacientes');

  return (
    <Gaveta
      aberto={aberto}
      aoMudar={aoMudar}
      titulo={perfil ? 'Editar perfil' : 'Novo perfil'}
      descricao="Escolha o que quem tiver este perfil pode abrir. Prontuário, sessões e documentos psicológicos são só do psicólogo e não entram aqui."
      rodape={
        <>
          <Botao variante="secundario" onClick={() => aoMudar(false)}>
            Cancelar
          </Botao>
          <Botao
            type="submit"
            form="form-perfil-acesso"
            variante="primario"
            carregando={salvar.isPending}
          >
            {perfil ? 'Salvar perfil' : 'Criar perfil'}
          </Botao>
        </>
      }
    >
      <form
        id="form-perfil-acesso"
        className="grid gap-5"
        noValidate
        onSubmit={(evento) => {
          void handleSubmit((valores) => salvar.mutate(valores))(evento);
        }}
      >
        <Campo rotulo="Nome do perfil" erro={errors.nome?.message}>
          <Entrada autoComplete="off" placeholder="Ex.: Secretária" {...register('nome')} />
        </Campo>
        <Campo rotulo="Para que serve" opcional erro={errors.descricao?.message}>
          <AreaTexto rows={2} {...register('descricao')} />
        </Campo>

        <fieldset className="grid gap-3">
          <legend className="text-base font-medium text-ink">O que este perfil pode abrir</legend>
          <Controller
            control={control}
            name="permissoes"
            render={({ field }) => (
              <div className="grid gap-3.5">
                {(catalogoQuery.data ?? []).map((item) => {
                  const concedida = pode(item.valor);
                  return (
                    <OpcaoMarcavel
                      key={item.valor}
                      rotulo={item.rotulo}
                      descricao={
                        concedida
                          ? item.descricao
                          : `${item.descricao} Você não tem este acesso, então não pode concedê-lo.`
                      }
                      checked={field.value.includes(item.valor)}
                      disabled={!concedida && !field.value.includes(item.valor)}
                      onChange={(evento) =>
                        field.onChange(
                          evento.target.checked
                            ? [...field.value, item.valor]
                            : field.value.filter((valor) => valor !== item.valor),
                        )
                      }
                    />
                  );
                })}
                {catalogoQuery.isPending ? (
                  <p className="text-sm text-ink-muted">Carregando…</p>
                ) : null}
                {catalogoQuery.isError ? (
                  <Aviso tom="perigo">
                    {mensagemDeErro(
                      catalogoQuery.error,
                      'Não foi possível carregar a lista de acessos.',
                    )}
                  </Aviso>
                ) : null}
              </div>
            )}
          />
          {errors.permissoes?.message ? (
            <p role="alert" className="text-sm text-danger-ink">
              {errors.permissoes.message}
            </p>
          ) : null}
        </fieldset>

        {faltaPacientes ? (
          <Aviso tom="aviso">
            Para marcar consultas, a pessoa também precisa do acesso a Pacientes. Sem ele, a lista
            de pacientes não abre.
          </Aviso>
        ) : null}
        {salvar.isError ? (
          <Aviso tom="perigo">
            {mensagemDeErro(salvar.error, 'Não foi possível salvar o perfil.')}
          </Aviso>
        ) : null}
      </form>
    </Gaveta>
  );
}
