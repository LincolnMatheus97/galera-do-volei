🧪 Guia de Testes Automatizados (Backend)

Este projeto abandonou testes manuais em favor de uma suíte robusta de testes automatizados de integração. Isso garante que as regras de negócio complexas e os fluxos de dependência permaneçam funcionais após refatorações.

Como Executar

Abra o terminal na pasta backend.
Execute o comando:

npm test -- -i

Nota: A flag -i (ou --runInBand) é obrigatória para evitar Race Conditions no SQLite.

Cobertura da Suíte

1. Autenticação (auth.test.ts)
✅ Criação de Conta: Valida criação bem-sucedida de jogador.
✅ Validação de Duplicidade: Garante que emails repetidos retornam 409 Conflict.
✅ Login: Valida credenciais corretas (retorna JWT) e incorretas (retorna erro).

2. Módulo de Partidas (partida.test.ts)
✅ Segurança: Bloqueia criação sem token (401 Unauthorized).
✅ Criação Gratuita: Valida defaults (preço 0, situação Aberta).
✅ Criação Completa (EventSync): Valida persistência de Preço, Chave PIX, Limite de Check-in, Banner e Carga Horária.
✅ Listagem: Garante que as partidas criadas aparecem no feed.

3. Fluxo de Inscrição (inscricao.test.ts)
✅ Solicitação: Jogador comum pede para entrar.
✅ Aprovação: Moderador aceita a solicitação.
✅ Financeiro: Confirmação de pagamento muda status para confirmada.
✅ Check-in (QR Code): Valida entrada com QR Code correto.
✅ Limite de Check-in: Bloqueia entradas excedentes (Regra de Negócio).

4. Fluxo Social (fluxo_social.test.ts)
✅ Privacidade: Bloqueia solicitação de amizade para perfis ocultos (404/Erro).
✅ Amizade: Solicitação e Aceite entre dois usuários diferentes (Perfis Públicos).
✅ Bloqueio de Chat: Bloqueia mensagens entre não-amigos.
✅ Chat Ativo: Envio e listagem de mensagens entre amigos confirmados.

5. Fluxo de Convites E2E (fluxo_convite.test.ts)
✅ Jornada Completa: Anfitrião convida -> Visitante lista -> Visitante aceita -> Sistema inscreve automaticamente.
✅ Robustez: Impede convites duplicados para a mesma pessoa/partida.

6. Funcionalidades Extras (funcionalidades_extras.test.ts)
✅ Exportação CSV: Moderador consegue baixar lista formatada.
✅ Bloqueio de Certificado: Impede download se usuário não fez Check-in.
✅ Check-in Real: Validação do fluxo de presença.
✅ Emissão de Certificado: Gera PDF corretamente (Status 200) após check-in validado.

Conclusão: O Backend atende a 100% dos requisitos do projeto EventSync, com cobertura total de testes ("Blindado").