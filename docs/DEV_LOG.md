Diário de Bordo - Projeto Final (Galera do Vôlei / EventSync)

Este documento é um registro cronológico detalhado das decisões técnicas, desafios enfrentados, erros encontrados e soluções aplicadas durante a evolução do projeto.

📅 Fase 1: Planejamento e Estratégia Inicial

1. Decisão de Legado vs Greenflied
Contexto: O projeto anterior "Galera do Vôlei" já possuía uma estrutura de pastas organizada (Controllers, Services), mas persistência em memória.
Decisão: Evoluir o projeto existente (Refactoring) em vez de começar do zero.
Justificativa: Aproveitar a estrutura de camadas já existente para focar na complexidade nova (Regras de Negócio e Banco de Dados), economizando tempo de setup inicial.

2. Definição da Stack Tecnológica
Backend: Node.js + Express (Mantido).
Linguagem: TypeScript (Strict Mode).
Banco de Dados: SQLite (Desenvolvimento) migrável para PostgreSQL. Escolhido pela facilidade de uso local (arquivo .db) sem necessidade de Docker.
ORM: Prisma ORM. Escolhido para garantir Type Safety (segurança de tipos) entre o Banco e o Código, evitando erros de SQL comuns.
Frontend (Futuro): Next.js (App Router) + TailwindCSS.

📅 Fase 2: Infraestrutura e Segurança (Backend)

3. Migração da Persistência (Memória -> Prisma)
Ação: Criação do schema.prisma mapeando as entidades Jogador, Partida, Inscricao, Convite e Avaliacao.
Ação: Implementação do padrão Repository Pattern na camada persistence.
Objetivo: Isolar o Prisma do resto da aplicação. Se trocarmos o ORM, só mexemos aqui.

4. Implementação de Autenticação (JWT)
Ação: Adicionado bcryptjs para hash de senhas (nunca salvar texto puro).
Ação: Adicionado jsonwebtoken para gerar tokens de sessão.
Ação: Criação do auth.middleware.ts para interceptar requisições e validar o header Authorization: Bearer <token>.

🐛 Problemas e Soluções (Infraestrutura)

Bug 1: Case Sensitive no Windows vs Node
Erro: File name '...HttpException.middleware.ts' differs from already included file name...
Causa: Importações inconsistentes (alguns lugares importavam com "h" minúsculo, o arquivo tinha "H" maiúsculo).
Solução: Padronização rigorosa de todos os arquivos e imports para PascalCase.

Bug 2: "Ovo e Galinha" no Middleware Global
Erro: Ao tentar criar um usuário (POST /jogadores), a API retornava 401 Unauthorized ("Erro no Token").
Causa: O authMiddleware estava sendo chamado no server.ts (app.use(authMiddleware)), bloqueando TODAS as rotas, inclusive as públicas (Login/Cadastro).
Solução: Remoção do middleware global. Aplicação pontual apenas nas rotas protegidas dentro dos arquivos de rota (routes/jogador.routes.ts, etc).

📅 Fase 3: Arquitetura Limpa (Clean Architecture & DDD)

5. Refatoração para Injeção de Dependência (DIP)
Análise: Percebemos que os Services estavam importando diretamente os Repositories Concretos. Isso violava o princípio de Inversão de Dependência do SOLID.
Ação:
Criação de Interfaces (IJogadorRepository, etc.) na camada Application.
Refatoração dos Services para receberem essas interfaces no Construtor.
Criação da pasta src/main (Composition Root) com o arquivo factories.ts, responsável por instanciar os repositórios concretos e injetá-los nos services.

6. Padronização de DTOs
Ação: Criação de src/shared/dto/index.ts para centralizar os tipos de dados de entrada (CriarJogadorDTO, CriarPartidaDTO), garantindo consistência entre Controller e Service.

🐛 Problemas e Soluções (Arquitetura)

Bug 3: A "Gambiarra" do Prisma no Service
Problema: Para validar regras complexas (ex: "Jogador já inscrito?"), o Service precisava acessar dados aninhados (include) que o tipo padrão do Prisma não trazia. A primeira tentativa foi importar o prisma client direto no Service para fazer queries.
Correção: Rejeitamos essa abordagem pois acoplava o Service ao Banco.
Solução: Criamos métodos especializados no Repositório (ex: verificarInscricaoExistente, buscarInscricoesPorPartida) que encapsulam a query complexa e retornam apenas o dado puro para o Service.

Bug 4: Falha de Segurança na Criação de Partida
Problema: O Controller aceitava nome_moderador no JSON, permitindo falsificação de identidade.
Solução: Controller refatorado para ignorar o body e usar apenas o user-id extraído do Token JWT pelo middleware.

📅 Fase 4: Qualidade e Testes Automatizados (QA)

7. Estratégia de Testes (Jest + Supertest)
Decisão: Substituir testes manuais (lentos e propensos a erro) por testes de integração automatizados.
Setup: Separação de app.ts (configuração do Express) e server.ts (abertura de porta) para permitir que o Supertest suba a API em memória.

🐛 Problemas e Soluções (A Batalha dos Testes)

Bug 5: Erro de Validação Mascarado (Senha Fraca)
Sintoma: O teste "Não deve permitir email duplicado" falhava com 400 Bad Request em vez de 409 Conflict.
Causa: O setup do teste usava senha "123". O Zod (validador) barrava a requisição por senha curta antes de chegar na verificação de banco.
Solução: Atualização dos payloads de teste para usar senhas fortes ("password123").

Bug 6: O Mistério do "Token Undefined" (Cascata de Erros)
Sintoma: Todos os testes de fluxo_convite.test.ts falhavam com 401 ou Bearer undefined.
Causa: O beforeAll (setup) falhava silenciosamente ao criar/logar o usuário (devido a sujeira no banco ou erro de validação), deixando a variável token vazia.
Solução: Implementação de Sanity Checks defensivos (if status !== 201 throw Error) no setup dos testes para garantir que o ambiente está íntegro.

Bug 7: Rota Desprotegida (GET /convites)
Sintoma: O teste de listar convites falhava com 401 mesmo com token válido.
Causa: O arquivo convite.routes.ts não tinha o authMiddleware na rota GET. O Controller tentava ler req.headers['user-id'], recebia undefined, convertia para NaN e lançava erro.
Solução: Adição do middleware na rota.

Bug 8: Race Conditions no SQLite
Sintoma: Testes falhavam aleatoriamente quando rodados juntos.
Causa: O SQLite trava quando múltiplos testes tentam escrever ao mesmo tempo.
Solução: Execução dos testes em série com a flag -i (npm test -- -i) e limpeza total do banco (deleteMany) no beforeAll e afterAll.

Bug 9: Erro de Tipo no Update do Prisma
Sintoma: Erro Invalid prisma.inscricao.update() invocation no teste de aceitar convite.
Causa: O Service passava uma string 'aceita' para o método do repositório, mas o repositório esperava um objeto parcial { status: 'aceita' }.
Solução: Correção da chamada no ConviteService para passar o objeto correto.

📅 Fase 5: Blindagem e Requisitos Finais

8. Funcionalidades Extras e Privacidade
Ação: Adição de biblioteca `pdfkit` para geração de Certificados.
Ação: Implementação de rota de Exportação CSV.
Ação: Adição de campos `visibilidade` (Jogador), `bannerUrl` e `cargaHoraria` (Partida) no Schema.

🐛 Bug 10: O Falso Erro de Auth (401 Geral)
Sintoma: A suíte `funcionalidades_extras.test.ts` falhava totalmente com 401 Unauthorized.
Causa: O setup do teste criava usuários com senha "123", mas o Zod exigia `min(6)`. O login falhava silenciosamente, o token ficava vazio, e todas as requisições subsequentes eram negadas.
Solução: Ajuste do teste para usar senha forte ("password123"), alinhado com a regra de negócio.

✅ Status Final
O backend está 100% Coberto por testes de integração que validam Auth, CRUD, Social, Privacidade, Arquivos (PDF/CSV) e Regras de Negócio complexas.

📅 Fase 6: Frontend - Fundação e Infraestrutura

9. Setup e Arquitetura do Frontend
Ação: Criação do projeto Next.js com App Router e TailwindCSS.
Ação: Ativação do React Compiler (Next.js 15/React 19) para otimização automática.
Ação: Configuração do Axios com Interceptors para injeção de Token JWT.
Ação: Implementação do AuthContext para gestão de sessão.

10. Decisão de Design: Duplicação Intencional de Tipos (Desacoplamento)
Contexto: Tínhamos interfaces LoginInput globais em src/types e schemas Zod locais nas páginas de Login/Cadastro.
Dúvida: Por que ter dois lugares definindo a mesma estrutura de dados?
Decisão: Manter a separação.

src/types/index.ts: Define o contrato com a API (Camada de Serviço). É estável.

z.infer<typeof schema>: Define a estrutura do formulário visual (Camada de Apresentação). É volátil (pode ter campos extras como "confirmar senha" que a API não recebe).
Benefício: Se a validação visual mudar, não quebramos a tipagem da API. Se a API mudar, o TypeScript avisa onde ajustar no serviço, sem necessariamente quebrar a validação visual de imediato. Isso aumenta a robustez e a manutenibilidade.

🐛 Problemas e Soluções (Integração Front-Back)

Bug 11: Bloqueio por CORS (Cross-Origin Resource Sharing)
Sintoma: Ao tentar fazer login no frontend (localhost:3000), o console mostrava "Network Error" e o terminal do backend registrava apenas uma requisição OPTIONS /login sem prosseguir para o POST.
Causa: O navegador bloqueia por segurança requisições entre portas diferentes (3000 -> 3333) se o servidor não disser explicitamente que permite.
Solução: Instalação do pacote cors no backend e configuração no app.ts para aceitar origens externas e headers de autorização.

📅 Fase 7: Frontend - Funcionalidades Core (MVP)

Implementação dos Fluxos Principais
Ação: Criação do Dashboard com listagem de eventos (Componente EventCard).
Ação: Criação da página de Criar Partida com formulário React Hook Form integrado à API.
Ação: Implementação da Página de Detalhes Dinâmica (/partidas/[id]) com lógica de inscrição.

🐛 Bug 12: Dados Extras no Payload (Hora)
Sintoma: Erro Unknown argument 'hora' vindo do Prisma ao tentar criar partida.
Causa: O formulário frontend tinha campos separados data e hora, e enviava ambos no JSON para o backend. O Schema do Prisma só aceita data (DateTime).
Solução: Refatoração do onSubmit no frontend para combinar data+hora em um ISOString e remover o campo hora do objeto antes do envio.

🐛 Bug 12: Dados Extras no Payload (Hora)
Sintoma: Erro Unknown argument 'hora' vindo do Prisma ao tentar criar partida.
Causa: O formulário frontend tinha campos separados data e hora, e enviava ambos no JSON para o backend. O Schema do Prisma só aceita data (DateTime).
Solução: Refatoração do onSubmit no frontend para combinar data+hora em um ISOString e remover o campo hora do objeto antes do envio.

Funcionalidade Operacional e Social
Ação: Implementação do QRCodeCard e página de scanner para Check-in.
Ação: Implementação da lógica de Adicionar Amigo na lista de participantes.
Ação: Criação da página de Mensagens (Social) para aceitar pedidos e conversar.

📅 Fase 8: Refinamento Social e Operacional

Blindagem do Fluxo Social
🐛 Bug 13: Unique Constraint Error no Banco
Sintoma: O backend quebrava com erro 500 ao tentar adicionar um amigo que já tinha solicitação.
Causa: O Repository tentava criar sem verificar. O Service usava validação incompleta (só checava 'aceita').
Solução:
Repository: Adicionado método buscarRelacao(idA, idB) para leitura pura.
Service: Implementada regra de negócio que lança ConflictError se buscarRelacao retornar algo.
Resultado: O erro de infraestrutura foi convertido em erro de negócio tratado (409 Conflict).

Correção do Fluxo de Convites
🐛 Bug 14: Convite para Partida Errada
Sintoma: O moderador criava um convite na tela da "Partida Intermediária", mas o convite chegava para a "Partida Amadora" (antiga).
Causa: O Service buscava a primeira partida aberta do moderador (find), ignorando o contexto.
Solução: Atualização do ConviteController e ConviteService para aceitar um id_partida opcional e atualização do Frontend para enviar o ID da partida atual.

Melhorias de UI e Home Page
Ação: Criação de uma Landing Page moderna (/) para usuários não logados.
Ação: Implementação da página de visualização de convites recebidos (/convites).
Ação: Correção no Backend para retornar o email do moderador, permitindo adicioná-lo como amigo.

Melhorias de UI e Home Page
Ação: Criação de uma Landing Page moderna (/) para usuários não logados.
Ação: Implementação da página de visualização de convites recebidos (/convites).
Ação: Correção no Backend para retornar o email do moderador, permitindo adicioná-lo como amigo.

📅 Fase 9: Ciclo de Vida Completo (Status e Avaliação)

Controle de Status do Evento
Ação: Implementação de botões para Fechar Inscrições, Reabrir e Finalizar Evento.
Ação: Bloqueio de novas inscrições e convites quando o evento não está "Aberta".

Sistema de Avaliação e Certificados
Ação: Criação do formulário de avaliação (Nota/Comentário) visível apenas após o evento ser Finalizado.
Ação: Implementação da regra de negócio: "Só avalia e baixa certificado quem fez Check-in".
Ação: Ajuste no PDFKit (Backend) para gerar um layout mais limpo e profissional.

Refinamentos Finais de UI
Ação: Botões de Editar Partida e Link para Scanner de Check-in posicionados estrategicamente no painel do moderador.
Ação: Exibição condicional de elementos baseada no status do usuário (Moderador, Inscrito, Confirmado).

✅ Status Final do Projeto:
Backend: 100% Funcional e Testado.
Frontend: 100% Integrado (Auth, CRUD, Operação, Social).
Arquitetura: Clean Architecture respeitada.
QA: Bugs críticos de integração resolvidos.