# Documento Inicial do Projeto — Sistema para Psicólogo

## Decisao de Produto: SaaS Multi-Conta

A Psique será desenvolvida como um produto SaaS para psicologos, com foco inicial em consultorios individuais.

O produto sera comercializado como assinatura, mas cada psicologo tera uma conta propria no sistema, funcionando como o ERP/gestor do seu consultorio.

Na pratica, a Psique une duas ideias:

* Produto SaaS: codigo-base unico, atualizacoes centralizadas, possibilidade de planos, modulos, assinaturas e provisionamento futuro.
* Sistema individual por conta: cada psicologo usa uma conta propria, com seus pacientes, agenda, registros clinicos, pagamentos, configuracoes e integracoes isoladas.

Essa direcao evita construir um projeto artesanal diferente para cada cliente.

O dominio do sistema continua pensado para um psicologo autonomo por conta. A operacao comercial pode ter muitos clientes, mas os dados de cada consultorio devem ficar isolados por conta.

## 1. Ideia do Projeto

A ideia do projeto é desenvolver um sistema voltado para a rotina de um psicólogo, permitindo que ele organize seus atendimentos, registre sessões, controle sua agenda e acompanhe o histórico dos pacientes de forma prática, segura e centralizada.

O sistema terá como foco principal o profissional de Psicologia. Ou seja, a maior parte das funcionalidades será pensada para facilitar o trabalho do psicólogo no dia a dia, desde o cadastro de pacientes até o registro das sessões realizadas.

Além disso, o projeto poderá contar com um chatbot integrado, porém com uma função limitada e administrativa. A ideia não é que o chatbot substitua o psicólogo ou realize atendimento psicológico, mas sim que ele funcione como um assistente administrativo para agendamentos, cancelamentos, remarcações, confirmações de horários e envio de lembretes.

Dessa forma, o sistema une duas partes principais:

* Um painel completo para o psicólogo gerenciar sua rotina.
* Um assistente virtual administrativo para auxiliar o paciente em tarefas simples relacionadas à agenda.

## 2. Objetivo Principal

O objetivo principal do sistema é oferecer ao psicólogo uma ferramenta completa para controlar sua agenda, registrar atendimentos e organizar as informações de seus pacientes.

O sistema deve permitir que o psicólogo saiba quais pacientes serão atendidos, em quais horários, quais sessões já aconteceram, quais foram canceladas e quais ainda estão pendentes.

Também deve permitir o registro do atendimento realizado, incluindo informações importantes sobre a sessão, data, horário, observações e acompanhamento do paciente.

O chatbot entra como uma funcionalidade complementar, ajudando a automatizar parte do processo de marcação de consultas, reduzindo o trabalho manual do psicólogo ou da pessoa responsável pela agenda.

## 3. Público-Alvo

O público-alvo principal do sistema é o psicólogo autônomo ou profissional que atende em consultório próprio.

O projeto será pensado para um psicólogo autônomo por conta.

O cliente ideal inicial é o psicólogo autônomo que quer um sistema próprio para organizar sua rotina, sem depender de planilhas, agenda manual ou ferramentas soltas.

A Psique deve ser tratada como um SaaS de nicho:

* Assinatura recorrente.
* Planos comerciais futuros.
* Módulos ativáveis.
* Atualização centralizada do código.
* Conta isolada por psicólogo.
* Possibilidade futura de painel administrativo da plataforma.

O paciente não será o usuário principal do sistema. Ele poderá interagir com o chatbot ou com uma área simples para agendamento, mas o foco do projeto será a gestão feita pelo psicólogo.

O sistema poderá ter usuários auxiliares, como recepcionista e administrador, mas esses perfis serão usados para apoiar a rotina da conta do psicólogo. O projeto não será modelado inicialmente para clínicas ou múltiplos psicólogos dentro da mesma conta.

## 4. Funcionamento Geral

O psicólogo acessa o sistema por meio de login e tem acesso ao seu painel principal.

Em produção, esse painel pertence à conta daquele psicólogo. Outros psicólogos que contratarem a Psique usarão suas próprias contas, com dados, configurações e integrações separados.

Nesse painel, ele poderá visualizar sua agenda, cadastrar pacientes, registrar sessões realizadas, consultar históricos, controlar atendimentos, acompanhar pagamentos e visualizar relatórios.

O paciente poderá entrar em contato por meio do chatbot para realizar ações simples, como marcar uma consulta, remarcar um horário, cancelar um atendimento ou confirmar presença.

Quando o paciente solicita um agendamento, o chatbot consulta os horários disponíveis conforme as configurações definidas pelo psicólogo. Após o paciente escolher uma data e horário, o sistema registra esse agendamento automaticamente.

O psicólogo poderá visualizar esse agendamento no painel e acompanhar o status da consulta.

## 5. Papel do Chatbot

O chatbot será utilizado apenas para funções administrativas.

Ele poderá ajudar o paciente com:

* Marcação de consulta.
* Remarcação de consulta.
* Cancelamento de consulta.
* Confirmação de presença.
* Consulta de horários disponíveis.
* Envio de lembretes.
* Orientações básicas sobre funcionamento do atendimento.
* Informações sobre regras de pagamento, cancelamento e remarcação.
* Encaminhamento para contato direto com o psicólogo quando necessário.

O chatbot não deverá realizar atendimento psicológico, interpretar sintomas, dar diagnósticos ou tentar substituir o contato humano com o profissional.

Caso o paciente envie uma mensagem com conteúdo sensível ou que exija análise profissional, o chatbot deverá orientar que o assunto seja tratado diretamente com o psicólogo.

Caso o paciente envie uma mensagem indicando situação urgente, crise emocional ou necessidade de ajuda imediata, o chatbot não deverá tentar conduzir a conversa sozinho. Nesses casos, ele deverá informar que não substitui atendimento profissional e orientar o paciente a buscar contato humano adequado, conforme as orientações configuradas pelo psicólogo.

O chatbot também deverá evitar armazenar informações clínicas detalhadas enviadas pelo paciente, exceto quando forem informações necessárias para fins administrativos, como agendamento, confirmação ou cancelamento.

## 6. Regras de Negócio Iniciais

### 6.1 Agenda

O psicólogo poderá configurar seus dias e horários disponíveis para atendimento.

O sistema deverá impedir que dois pacientes sejam agendados no mesmo horário para o mesmo psicólogo.

Cada agendamento deverá possuir um status, como:

* Agendado.
* Aguardando confirmação.
* Confirmado.
* Realizado.
* Cancelado.
* Remarcado.
* Paciente não compareceu.

O psicólogo poderá bloquear horários específicos em sua agenda, como intervalos, compromissos pessoais, feriados ou períodos de indisponibilidade.

O psicólogo também poderá configurar a duração padrão das sessões, como 30, 40, 50 ou 60 minutos.

Em uma versão mais completa, poderá existir duração diferente por tipo de atendimento, por exemplo:

* Primeira consulta.
* Retorno.
* Sessão individual.
* Atendimento online.
* Atendimento presencial.
* Avaliação inicial.

### 6.2 Agendamento pelo Chatbot

O chatbot só poderá oferecer horários que estejam disponíveis na agenda do psicólogo.

Quando o paciente escolher um horário, o sistema deverá criar o agendamento automaticamente.

Dependendo da configuração do psicólogo, o agendamento poderá ficar confirmado automaticamente ou aguardando confirmação manual.

O chatbot deverá informar ao paciente as regras de cancelamento, remarcação e pagamento antes de finalizar o agendamento.

Caso não existam horários disponíveis, o chatbot poderá oferecer a opção de colocar o paciente em uma lista de espera.

### 6.3 Cancelamento e Remarcação

O psicólogo poderá configurar regras próprias para cancelamento e remarcação.

Exemplo:

* Permitir cancelamento até 24 horas antes da consulta.
* Permitir remarcação até 12 horas antes.
* Bloquear cancelamento em cima da hora.
* Permitir cancelamento livre.
* Exigir justificativa para cancelamento.

Essas regras devem ser configuráveis, pois cada psicólogo pode ter uma forma diferente de trabalhar.

Caso o paciente tente cancelar ou remarcar fora do prazo permitido, o sistema deverá informar que a ação não está disponível automaticamente e orientar o paciente a entrar em contato diretamente com o psicólogo.

### 6.4 Pagamento

O sistema poderá permitir diferentes formas de pagamento, de acordo com a configuração do psicólogo.

Possibilidades:

* Pagamento antecipado.
* Pagamento no dia da consulta.
* Pagamento manual.
* Pagamento via PIX.
* Pagamento por cartão.
* Integração futura com plataformas como Stripe ou outro provedor.

O sistema não deve obrigar o psicólogo a usar uma única forma de pagamento.

Caso o psicólogo trabalhe com pagamento antecipado, o sistema poderá exigir a confirmação do pagamento antes de confirmar o horário.

Caso o pagamento seja manual, o psicólogo poderá marcar no sistema se a sessão foi paga ou não.

O pagamento também poderá possuir status, como:

* Pendente.
* Pago.
* Cancelado.
* Reembolsado.
* Aguardando confirmação.

### 6.5 Registro da Sessão

Após realizar um atendimento, o psicólogo poderá registrar a sessão no sistema.

Esse registro poderá conter:

* Data do atendimento.
* Paciente atendido.
* Tipo de atendimento.
* Observações sobre a sessão.
* Evolução do paciente.
* Encaminhamentos.
* Próxima sessão sugerida.
* Informações internas do psicólogo.

O registro da sessão deve ser privado e acessível apenas ao psicólogo responsável.

O paciente não deve ter acesso automático às anotações internas do profissional.

### 6.6 Política de Alteração de Registro Clínico

Os registros clínicos devem ser tratados com cuidado, pois representam informações importantes sobre os atendimentos realizados.

Por esse motivo, o sistema não deverá permitir que registros de sessão sejam apagados definitivamente de forma simples.

Caso seja necessário corrigir alguma informação, o sistema poderá permitir a edição ou retificação do registro, mantendo um histórico da alteração.

O sistema deverá registrar:

* Quem alterou o registro.
* Data e hora da alteração.
* Qual informação foi alterada.
* Motivo da alteração, se necessário.

Essa regra ajuda a manter a integridade do histórico do paciente e evita perda de informações importantes.

### 6.7 Segurança e Privacidade

Como o sistema lidará com informações pessoais e sensíveis, ele deverá ter cuidado especial com segurança.

O sistema deverá possuir login com senha, controle de acesso e proteção dos dados dos pacientes.

Informações clínicas não devem ser acessadas por usuários que não tenham permissão.

Toda informação relacionada aos atendimentos deve ser tratada com sigilo.

O sistema deverá considerar recursos como:

* Autenticação de usuários.
* Controle de permissões.
* Expiração de sessão após período de inatividade.
* Proteção contra acesso não autorizado.
* Backup dos dados.
* Recuperação segura de senha.
* Criptografia de informações sensíveis, quando necessário.

### 6.8 Separação entre Dados Administrativos e Dados Clínicos

O sistema deverá separar dados administrativos de dados clínicos.

Dados administrativos são informações usadas para a gestão do atendimento, como:

* Nome do paciente.
* Telefone.
* E-mail.
* Agenda.
* Status da consulta.
* Pagamento.
* Forma de contato.
* Confirmação de presença.

Dados clínicos são informações relacionadas ao atendimento psicológico, como:

* Registro da sessão.
* Evolução do paciente.
* Observações clínicas.
* Encaminhamentos.
* Histórico psicológico.
* Anotações internas do psicólogo.

Essa separação é importante porque nem todos os usuários do sistema devem ter acesso às informações clínicas.

Por exemplo, uma recepcionista pode acessar agenda, horários e pagamentos, mas não deve visualizar registros psicológicos ou observações internas do profissional.

### 6.9 Controle de Acesso

O sistema deverá possuir controle de acesso por perfil de usuário.

Cada perfil terá permissões diferentes dentro do sistema.

Exemplo de perfis:

* Psicólogo.
* Recepcionista.
* Paciente.
* Administrador.

O psicólogo poderá:

* Acessar seus pacientes.
* Visualizar agenda.
* Registrar sessões.
* Consultar histórico clínico.
* Gerar documentos.
* Controlar pagamentos, se necessário.
* Visualizar relatórios.

A recepcionista poderá:

* Cadastrar pacientes.
* Agendar consultas.
* Cancelar ou remarcar horários.
* Confirmar presença.
* Visualizar pagamentos.
* Não acessar registros clínicos.

O paciente poderá:

* Visualizar seus próprios agendamentos.
* Solicitar agendamento.
* Solicitar cancelamento ou remarcação.
* Confirmar presença.
* Não acessar registros internos do psicólogo.

O administrador poderá:

* Gerenciar usuários.
* Configurar o sistema.
* Controlar permissões.
* Gerenciar configurações gerais.
* Não acessar conteúdo clínico sem autorização.

A regra principal é que nem todo usuário que acessa o cadastro de um paciente poderá acessar o conteúdo clínico desse paciente.

### 6.10 Auditoria

O sistema deverá registrar ações importantes realizadas pelos usuários.

A auditoria servirá para manter um histórico de alterações e aumentar a segurança das informações.

Exemplos de ações que devem gerar log:

* Criação de paciente.
* Edição de dados do paciente.
* Criação de agendamento.
* Cancelamento de consulta.
* Remarcação de consulta.
* Registro de sessão.
* Edição de registro clínico.
* Confirmação de pagamento.
* Alteração de permissões.
* Login no sistema.
* Tentativa de acesso negada.

Cada log poderá armazenar:

* Usuário que realizou a ação.
* Data e hora.
* Tipo de ação.
* Registro afetado.
* Descrição da alteração.
* Endereço IP, se necessário.

Isso evita que alterações importantes aconteçam sem rastreamento.

### 6.11 Lembretes Automáticos

O sistema poderá enviar lembretes automáticos para os pacientes antes da consulta.

O psicólogo poderá configurar quando os lembretes serão enviados.

Exemplo:

* 24 horas antes da sessão.
* 2 horas antes da sessão.
* No dia da sessão.
* Após o agendamento ser confirmado.

Os lembretes poderão ser enviados por canais como:

* E-mail.
* WhatsApp, em integração futura.
* SMS, em integração futura.
* Mensagem pelo próprio chatbot.

O lembrete poderá conter informações como:

* Nome do paciente.
* Data e horário da consulta.
* Modalidade do atendimento.
* Endereço ou link da sessão online.
* Regras de cancelamento e remarcação.

### 6.12 Lista de Espera

O sistema poderá ter uma lista de espera para pacientes que desejam atendimento, mas não encontram horário disponível.

Quando um paciente não encontrar horário livre, o chatbot ou o sistema poderá oferecer a opção de entrar na lista de espera.

A lista de espera poderá armazenar:

* Paciente interessado.
* Preferência de dia.
* Preferência de horário.
* Tipo de atendimento desejado.
* Data em que entrou na lista.
* Prioridade, se necessário.

Caso um horário seja cancelado ou liberado, o sistema poderá avisar o psicólogo ou notificar automaticamente os pacientes da lista, conforme a configuração definida.

Essa funcionalidade ajuda o psicólogo a preencher horários vagos e melhora a experiência do paciente.

### 6.13 Relatórios

O sistema poderá oferecer relatórios para ajudar o psicólogo a acompanhar sua rotina e seus resultados.

Esses relatórios serão voltados para gestão e organização, não para substituir análise clínica.

Exemplos de relatórios:

* Quantidade de sessões realizadas no mês.
* Quantidade de consultas agendadas.
* Quantidade de consultas canceladas.
* Quantidade de faltas.
* Pacientes ativos.
* Pacientes inativos.
* Valores recebidos.
* Pagamentos pendentes.
* Horários mais ocupados.
* Taxa de comparecimento.
* Histórico de atendimentos por paciente.

Os relatórios poderão ajudar o psicólogo a entender melhor sua agenda, seus horários mais movimentados e sua organização financeira.

### 6.14 Flexibilidade para o Psicólogo

Uma regra importante do projeto é permitir que o psicólogo configure o sistema conforme sua forma de trabalho.

O sistema não deve ser rígido demais.

O profissional poderá definir:

* Dias disponíveis.
* Horários de atendimento.
* Duração padrão das sessões.
* Regras de cancelamento.
* Regras de remarcação.
* Forma de pagamento.
* Confirmação automática ou manual dos horários.
* Mensagens automáticas enviadas ao paciente.
* Tempo de antecedência dos lembretes.
* Se deseja ou não usar lista de espera.
* Se deseja confirmação manual ou automática de novos horários.

Essa flexibilidade torna o sistema mais útil, pois cada profissional pode adaptar o funcionamento à sua rotina.

### 6.15 Modelo SaaS e Contas

A Psique deve ser preparada para crescer como produto SaaS.

Regras iniciais:

* O código-base deve ser único.
* Cada psicólogo deve ter uma conta própria.
* Cada conta deve representar um consultório individual.
* Os dados de pacientes, agenda, pagamentos, sessões e registros clínicos devem ficar isolados por conta.
* O MVP deve usar `ContaPsicologoId` nas tabelas de domínio que guardam dados da conta.
* A operação comercial futura poderá criar um painel central para clientes, planos, assinaturas e provisionamento.
* Dados comerciais da assinatura não devem se misturar com dados clínicos.

Módulos futuros podem ser ativados conforme plano:

* WhatsApp Bridge.
* Chatbot administrativo.
* Lembretes.
* Relatórios avançados.
* Documentos.
* IA assistiva.
* Integrações financeiras.

## 7. Visão Geral do Fluxo

O funcionamento básico do sistema pode ser resumido assim:

1. O psicólogo configura sua agenda e regras de atendimento.
2. O paciente entra em contato pelo chatbot.
3. O chatbot mostra os horários disponíveis.
4. O paciente escolhe uma data e horário.
5. O sistema cria o agendamento.
6. O paciente recebe a confirmação ou aguarda aprovação.
7. O sistema envia lembretes automáticos conforme a configuração.
8. O psicólogo visualiza o atendimento na agenda.
9. A sessão acontece.
10. O psicólogo registra o atendimento no sistema.
11. O histórico do paciente é atualizado.
12. O sistema gera registros de auditoria para ações importantes.
13. Os dados podem ser usados em relatórios administrativos.

Caso não exista horário disponível, o paciente poderá entrar em uma lista de espera.

Caso o paciente envie mensagem sensível ao chatbot, o sistema deverá encaminhar para contato humano e não tentar realizar atendimento psicológico.

## 8. Limites do Projeto

O sistema não terá como objetivo substituir o psicólogo.

O chatbot não deverá realizar terapia, diagnóstico, aconselhamento psicológico ou qualquer tipo de atendimento clínico.

O chatbot será apenas uma ferramenta de apoio administrativo.

A responsabilidade pelo atendimento, análise, acompanhamento e registro profissional continuará sendo do psicólogo.

O sistema também não deverá permitir que usuários sem permissão acessem dados clínicos dos pacientes.

O chatbot deverá ter limites claros para não transformar uma conversa administrativa em uma tentativa de atendimento psicológico automatizado.

## 9. Resumo da Proposta

O projeto será um SaaS de gestão para psicólogos, com foco em contas individuais de consultório. Para cada psicólogo, o sistema funciona como seu gestor próprio, com agenda, registro de sessões, histórico de pacientes, controle de pagamentos, relatórios e organização dos atendimentos.

O diferencial do sistema será a possibilidade de integrar um assistente virtual administrativo, capaz de automatizar agendamentos, remarcações, cancelamentos, confirmações e lembretes.

A proposta busca facilitar a rotina do psicólogo, reduzir trabalho manual, organizar informações importantes e melhorar a comunicação com o paciente, sem substituir o atendimento humano.

Além disso, o sistema deverá considerar desde o início pontos importantes como privacidade, controle de acesso, separação entre dados administrativos e clínicos, auditoria, segurança dos registros e limites claros para o uso do chatbot.
