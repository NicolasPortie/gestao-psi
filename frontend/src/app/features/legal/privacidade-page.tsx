import { Link } from 'react-router';

import { DocumentoLegal, SecaoLegal } from './documento-legal';

export default function PrivacidadePage() {
  return (
    <DocumentoLegal
      titulo="Política de privacidade"
      resumo="Quais dados o GestãoPsi trata, para quê, como são protegidos e quais são os seus direitos, segundo a Lei Geral de Proteção de Dados (LGPD)."
    >
      <SecaoLegal numero={1} titulo="Papéis no tratamento">
        <ul>
          <li>
            <strong>Dados dos pacientes e do consultório:</strong> o psicólogo titular da conta é o controlador. O GestãoPsi atua como operador, tratando
            os dados apenas para prestar o serviço.
          </li>
          <li>
            <strong>Dados de acesso do próprio usuário</strong> (nome, e-mail, perfil, CRP e registros de acesso): o GestãoPsi é o controlador, para
            autenticar, proteger a conta e cumprir obrigações legais.
          </li>
        </ul>
      </SecaoLegal>

      <SecaoLegal numero={2} titulo="Dados tratados">
        <ul>
          <li>cadastro do usuário: nome, e-mail, perfil, CRP e senha (guardada somente como hash);</li>
          <li>cadastro administrativo do paciente: nome, data de nascimento, CPF, contatos e observações administrativas;</li>
          <li>dados de saúde: prontuário, registros de sessão, evoluções e documentos psicológicos, que são dados pessoais sensíveis;</li>
          <li>agenda, pagamentos registrados manualmente, lembretes e mensagens administrativas de WhatsApp e e-mail;</li>
          <li>registros de auditoria: ação, data e hora, usuário, endereço IP e navegador.</li>
        </ul>
      </SecaoLegal>

      <SecaoLegal numero={3} titulo="Para que usamos">
        <p>
          Para operar a agenda e o consultório, registrar o acompanhamento clínico, enviar lembretes, gerar relatórios administrativos, proteger as
          contas contra acesso indevido e manter a trilha de auditoria. Não usamos dados clínicos para publicidade, perfilamento ou venda a terceiros.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={4} titulo="Como protegemos">
        <ul>
          <li>Isolamento por conta: toda consulta aos dados é filtrada pela conta da sessão autenticada, e não por um identificador enviado pela tela.</li>
          <li>Criptografia em repouso dos campos clínicos, do CPF, do CRP, dos contatos, das mensagens e dos tokens de integração.</li>
          <li>Senhas somente como hash; tokens de sessão e de recuperação guardados como hash; limite de tentativas de acesso.</li>
          <li>Permissões por perfil: a recepção não acessa conteúdo clínico, e o servidor recusa a requisição.</li>
          <li>Sessão com token de acesso apenas em memória e cookie de renovação protegido; sair ou trocar a senha encerra sessões.</li>
          <li>Registro de auditoria sem senhas, tokens nem conteúdo clínico em texto aberto.</li>
          <li>Tráfego protegido por HTTPS nos ambientes de produção.</li>
        </ul>
      </SecaoLegal>

      <SecaoLegal numero={5} titulo="Com quem compartilhamos">
        <p>
          Não vendemos dados. O compartilhamento ocorre apenas quando necessário para o serviço: a integração de WhatsApp (Bridge) configurada pelo
          psicólogo, para entregar mensagens, e o servidor de e-mail, para mensagens de recuperação de senha e avisos. Também podemos divulgar dados
          por obrigação legal ou ordem de autoridade competente.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={6} titulo="Cookies e armazenamento no navegador">
        <p>
          Usamos um cookie essencial, protegido contra leitura por scripts, para manter a sessão. Guardamos no navegador apenas a sua preferência de
          tema (claro, escuro ou do sistema). Não usamos cookies de publicidade nem ferramentas de rastreamento. Dados clínicos não são guardados no
          navegador.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={7} titulo="Seus direitos">
        <p>
          Nos termos da LGPD, o titular pode pedir confirmação do tratamento, acesso, correção, anonimização, portabilidade e eliminação dos dados, além
          de informação sobre compartilhamentos.
        </p>
        <ul>
          <li>
            <strong>Pacientes:</strong> o pedido deve ser feito ao psicólogo responsável pelo atendimento, que decide como atendê-lo, com o apoio do sistema.
          </li>
          <li>
            <strong>Usuários:</strong> corrija seus dados em <Link to="/configuracoes/profissional">Dados profissionais</Link> e{' '}
            <Link to="/configuracoes/conta">Conta e segurança</Link>. Para os demais pedidos, use o canal de suporte do serviço.
          </li>
        </ul>
      </SecaoLegal>

      <SecaoLegal numero={8} titulo="Guarda dos dados">
        <p>
          Os prazos de guarda de prontuário e de documentos seguem a regulamentação profissional aplicável e são de responsabilidade do psicólogo
          titular da conta. Dados de acesso e auditoria são mantidos enquanto a conta existir e pelo prazo necessário para cumprir obrigações legais.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={9} titulo="Incidentes e mudanças">
        <p>
          Em caso de incidente de segurança que possa causar risco relevante, comunicaremos os responsáveis pela conta e as autoridades, conforme a
          lei. Esta política pode ser atualizada; cada aceite registra a versão e a data. Veja também os <Link to="/termos">termos de uso</Link>.
        </p>
      </SecaoLegal>
    </DocumentoLegal>
  );
}
