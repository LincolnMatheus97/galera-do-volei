Plano de Upgrade: Galera do Vôlei -> EventSync

1. Backend (API REST) - 100% CONCLUÍDO ✅

A. Infraestrutura e Banco de Dados
[x] Configuração do Monorepo.
[x] Setup do Prisma ORM e SQLite.
[x] Modelagem do Schema (Entidades: Jogador, Partida, Inscricao, Convite, Avaliacao, Amizade, Mensagem).
[x] Implementação de Repositórios Concretos.

B. Autenticação & Segurança
[x] Hash de senha (bcryptjs).
[x] Geração e Validação de JWT.
[x] Middleware de Proteção de Rotas.
[x] Associação segura de ações ao ID do Token (evitar ID no body).

C. Refatoração Arquitetural (Clean Code)
[x] Implementação de Interfaces de Repositório (src/domain).
[x] Injeção de Dependência nos Services.
[x] Criação de Factories (Composition Root em src/main).
[x] Padronização de DTOs (src/shared/dto).
[x] Centralização de Erros (src/shared/errors).

D. Funcionalidades de Negócio (EventSync)
[x] Financeiro: Preço, PIX, Confirmação de Pagamento.
[x] Operacional: Check-in com validação de QR Code e limite.
[x] Social: Solicitar/Aceitar Amizade e Troca de Mensagens.
[x] Convites: Fluxo seguro (Dono convida -> Convidado aceita -> Inscrição automática).

E. Qualidade (QA Automatizado)
[x] Configuração do Jest e Supertest.
[x] Testes de Integração: Auth, Partida, Inscrição (Pagamento/Checkin).
[x] Teste E2E do Fluxo de Convites.
[x] Teste E2E do Fluxo Social.

F. Extras & Blindagem (Requisitos Finais)
[x] Exportação de Lista de Inscritos (CSV).
[x] Emissão de Certificados em PDF (Validando Check-in).
[x] Controle de Privacidade (Perfil Oculto/Visibilidade).
[x] Novos Campos: Banner do Evento e Carga Horária.
[x] Correção de setups de teste (Senha Forte).

Frontend (Next.js) - 100% CONCLUÍDO ✅

Infraestrutura
[x] Projeto Next.js + TailwindCSS.
[x] Axios + Interceptors + AuthContext.
[x] Tipagem TypeScript.

Telas e Fluxos (MVP)
[x] Auth: Login e Cadastro com validação visual.
[x] Home: Landing Page responsiva.
[x] Dashboard: Listagem de Eventos e "Meus Eventos".
[x] Criação: Formulário de Partida com todos os campos.
[x] Detalhes: Página dinâmica com lógica de inscrição/aprovação.
[x] Operação: Geração de QR Code e Scanner de Check-in.
[x] Social: Página de Convites, Mensagens e Botão de Amizade.
[x] Pós-Evento: Avaliação e Download de Certificado.

Projeto pronto para apresentação! 🏐