Arquitetura do Projeto EventSync (Galera do Vôlei)

Este documento descreve a organização física e lógica do projeto, consolidando as práticas de Clean Architecture, SOLID e DDD aplicadas.

1. Estrutura de Pastas (Monorepo)

```
galera-do-volei/
├── backend/                  # API REST (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── application/      # CAMADA DE APLICAÇÃO (Regras de Negócio)
│   │   │   ├── service/      # Casos de Uso (Logica Pura, desacoplada)
│   │   │
│   │   ├── domain/           # CAMADA DE DOMÍNIO (Núcleo)
│   │   │   └── repositories/ # Interfaces/Contratos (DIP)
│   │   │
│   │   ├── persistence/      # CAMADA DE INFRAESTRUTURA (Banco)
│   │   │   ├── prisma/       # Cliente ORM e Schema
│   │   │   └── repositories/ # Implementação Concreta (Prisma)
│   │   │
│   │   ├── presentation/     # CAMADA DE APRESENTAÇÃO (HTTP)
│   │   │   ├── controllers/  # Recebem Request, chamam Services
│   │   │   ├── middleware/   # Auth, Logs, Validação
│   │   │   └── routes/       # Definição de endpoints
│   │   │
│   │   ├── shared/           # CAMADA COMPARTILHADA (Utils)
│   │   │   ├── dto/          # Tipos de Dados (Input/Output)
│   │   │   └── errors/       # Classes de Erro Customizadas
│   │   │
│   │   ├── infra/            # SERVIÇOS EXTERNOS (Mock/Libs)
│   │   │   └── email/        # Simulação de envio de email
│   │   │
│   │   └── main/             # COMPOSITION ROOT (Raiz)
│   │       ├── factories.ts  # Injeção de Dependência
│   │       ├── app.ts        # Configuração do App
│   │       └── server.ts     # Entrypoint
│   │
│   ├── tests/                # Testes de Integração
│   └── package.json
│
├── frontend/                 # Web App (Next.js 16 + React 19)
│   ├── src/
│   │   ├── app/              # App Router (Páginas e Rotas)
│   │   ├── components/       # UI Reutilizável (EventCard, Navbar, Input)
│   │   ├── context/          # Gerenciamento de Estado Global (AuthContext)
│   │   ├── services/         # Cliente HTTP (Axios + Interceptors)
│   │   └── types/            # Definições de Tipagem (Espelho do DTO)
├── docs/                     # Documentação Viva
└── README.md
```


2. Fluxo de Dados e Decisões

Inversão de Dependência (DIP)
O coração da arquitetura. A camada de Aplicação (Service) define Interfaces (domain/repositories) que a camada de Persistência deve implementar.
Benefício: O Service não sabe que existe um banco de dados. Isso facilita testes unitários (mocking) e troca de tecnologias.

Transferência de Dados (DTOs)
Utilizamos objetos tipados (shared/dto) para garantir que os dados que entram no Controller e chegam ao Service estejam validados e estruturados, evitando o uso de any.

Segurança
Auth: JWT no Header (Authorization: Bearer).
Identidade: Ações sensíveis (criar partida, enviar mensagem) extraem o ID do usuário diretamente do token validado, ignorando dados enviados no corpo da requisição para prevenir falsificação.

3. Stack Tecnológica & Decisões

Runtime: Node.js v20+
Linguagem: TypeScript (Configurado em Strict Mode).
Framework Web: Express.
ORM: Prisma (Schema, Migrations e Type Safety).
Banco de Dados: SQLite (Dev) -> Fácil migração para Postgres.
Geração de Arquivos: PDFKit (Certificados) e Template String (CSV).
Testes: Jest + Supertest (Testes de API/Integração).
Auth: JWT + Bcrypt.

4. Estratégia de Qualidade (QA)

Não utilizamos testes unitários isolados (mockando tudo) por serem frágeis a refatoração. Adotamos Testes de Integração Vertical:
1. Levantamos a aplicação inteira em memória.
2. Usamos um banco de dados real (SQLite em arquivo temporário).
3. Disparamos requisições HTTP reais.

Isso garante que Rotas + Controllers + Services + Repositórios + Banco estão conversando corretamente.