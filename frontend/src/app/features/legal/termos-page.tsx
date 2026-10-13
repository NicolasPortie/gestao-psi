import { Link } from 'react-router';

import { MARCA } from '../../core/marca';
import { DocumentoLegal, SecaoLegal } from './documento-legal';

export default function TermosPage() {
  return (
    <DocumentoLegal
      titulo="Termos de uso"
      resumo={`As regras para usar o ${MARCA.nome}, um sistema de gestão para psicólogos autônomos. Leia com atenção antes de criar sua conta.`}
    >
      <SecaoLegal numero={1} titulo="O serviço">
        <p>
          O {MARCA.nome} é um sistema web para a rotina de um consultório individual: agenda, pacientes, consultas, prontuário, documentos, pagamentos,
          lembretes e comunicação administrativa. Cada conta pertence a um consultório e seus dados ficam isolados dos de qualquer outra conta.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={2} titulo="Quem pode usar">
        <p>
          A conta é aberta por um psicólogo com registro profissional ativo, que informa o CRP no cadastro. O psicólogo pode convidar pessoas da
          recepção ou da administração, com permissões limitadas. Pacientes não acessam o sistema.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={3} titulo="Conta e acesso">
        <ul>
          <li>As credenciais são pessoais. Não as compartilhe; cada pessoa da equipe deve ter o próprio usuário.</li>
          <li>Quem administra a conta responde pelas pessoas que convida e pode bloquear o acesso delas a qualquer momento.</li>
          <li>A recepção não acessa prontuário nem documentos psicológicos. Essa regra é aplicada pelo servidor, não apenas pela tela.</li>
          <li>Em caso de suspeita de acesso indevido, altere a senha em Conta e segurança, o que encerra as demais sessões.</li>
        </ul>
      </SecaoLegal>

      <SecaoLegal numero={4} titulo="Responsabilidade pelos dados dos pacientes">
        <p>
          O psicólogo é o responsável pelos dados dos pacientes que cadastra e pelo sigilo profissional. Cabe a ele registrar apenas o necessário,
          obter e documentar a base legal e o consentimento aplicáveis e cumprir as normas do seu conselho profissional. O {MARCA.nome} trata esses dados
          em nome do psicólogo, conforme descrito na <Link to="/privacidade">política de privacidade</Link>.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={5} titulo="Uso adequado">
        <p>Não é permitido:</p>
        <ul>
          <li>acessar dados de outra conta ou tentar contornar o isolamento entre contas;</li>
          <li>usar o sistema para fins ilícitos ou para enviar mensagens indesejadas;</li>
          <li>sobrecarregar, testar a segurança ou fazer engenharia reversa do serviço sem autorização;</li>
          <li>registrar conteúdo clínico em campos administrativos, que são visíveis para a equipe.</li>
        </ul>
      </SecaoLegal>

      <SecaoLegal numero={6} titulo="WhatsApp e e-mail">
        <p>
          O envio de lembretes e mensagens por WhatsApp depende de uma integração (Bridge) configurada pelo próprio psicólogo, e o e-mail depende de um
          servidor SMTP. Esses serviços são de terceiros e têm seus próprios termos. O assistente automático é administrativo: ele ajuda com horários e
          confirmações e encaminha para uma pessoa qualquer mensagem que pareça tratar de conteúdo sensível. Ele não presta atendimento clínico.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={7} titulo="Disponibilidade">
        <p>
          Empregamos esforços razoáveis para manter o serviço disponível, mas ele pode ficar indisponível por manutenção ou por falhas fora do nosso
          controle. Mantenha seus próprios registros profissionais conforme exigido pela sua profissão.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={8} titulo="Mudanças nestes termos">
        <p>
          Estes termos podem ser atualizados. Cada aceite registra a versão e a data. Em mudanças relevantes, um novo aceite poderá ser solicitado
          antes de você continuar usando o sistema.
        </p>
      </SecaoLegal>

      <SecaoLegal numero={9} titulo="Encerramento">
        <p>
          Você pode deixar de usar o serviço quando quiser. Podemos suspender uma conta que viole estes termos ou que ofereça risco a outras contas.
          Antes de encerrar, guarde o que a sua profissão exige que você conserve.
        </p>
      </SecaoLegal>
    </DocumentoLegal>
  );
}
