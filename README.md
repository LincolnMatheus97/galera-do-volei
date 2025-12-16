# Galera do Vôlei (EventSync) 🏐

> **Disciplina:** Programação para Internet II – IFPI (2025.2)
> **Professor:** Rogério Silva
> **Projeto Final:** EventSync + IA

Este repositório contém a implementação completa do sistema **Galera do Vôlei**, uma plataforma web responsiva para gerenciamento de eventos esportivos, desenvolvida conforme a especificação **EventSync**.
O projeto representa a evolução de um script simples de estudo para uma aplicação **Full Stack** robusta, aplicando **Clean Architecture**, **SOLID**, **Testes Automatizados** e **Integração Frontend/Backend**.

![PaginaDePartida](https://i.imgur.com/aiWSIn6.png)
![Certificado](https://i.imgur.com/ZOkQGxj.png)


## A Jornada da Evolução

O projeto foi desenvolvido em três fases, servindo como estudo de caso sobre maturidade de software.

### Fase 1: O Monólito (Ponto de Partida)

Tudo começou em um único arquivo: **[_index_monolitico.ts](https://github.com/LincolnMatheus97/galera-do-volei/blob/main/backend/src/_index_monolitico.ts)**, junto a sua documentação que está no **[_README.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/main/_README.md)**

* Toda a lógica concentrada em um único ponto (rotas, validação e dados em memória)
* Baixa manutenibilidade, difícil escalar e testar

### Fase 2: Arquitetura em Camadas (Refatoração)

Evolui para uma aplicação com arquitetura em camadas no backend, aqui esta uma documentação detalhada sobre essa transformação: **[__README.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/__README.md)**

### Fase 3: Sistema Completo (Estado Atual)

Então agora o backend foi reescrito adotando **Clean Architecture**.

* Separação em `Presentation`, `Application`, `Domain` e `Persistence`
* Uso de **Prisma ORM (SQLite)**, **Zod** para validações e **JWT** para autenticação

Integração total com frontend moderno e funcionalidades avançadas do EventSync.

* Interface **Mobile First**
* QR Code e Scanner de Check-in
* Fluxo social entre participantes
* Pagamento via **PIX (simulado)**
* Emissão automática de **Certificados em PDF**


## Funcionalidades (EventSync)

O sistema atende aos requisitos do documento **“EventSync + IA – Projeto Final Disciplina”**.

### Jornada do Organizador (Moderador)

* Criar, editar, abrir/fechar inscrições e finalizar eventos
* Configurar eventos gratuitos ou pagos (chave PIX)
* Definir limite de check-ins e banner personalizado
* Aprovar ou recusar inscrições pendentes
* Realizar check-in via **Scanner de QR Code**
* Exportar lista de presença (CSV)
* Visualizar avaliações pós-evento

### Jornada do Jogador (Participante)

* Visualizar feed de eventos públicos e “Meus Eventos”
* Inscrição automática (gratuitos) ou com aprovação/pagamento (pagos)
* Ticket digital com **QR Code** exclusivo
* Sistema social: amigos e mensagens privadas (restrito ao mesmo evento)
* Avaliar eventos após o check-in
* Download automático do **Certificado de Participação (PDF)**

## Stack Tecnológica

### Backend (API REST)

* Node.js + Express
* TypeScript (Strict Mode)
* Clean Architecture / DDD
* SQLite + Prisma ORM
* Testes: Jest + Supertest
* Extras:

  * `pdfkit` (certificados)
  * `bcryptjs` (hash de senhas)
  * `jsonwebtoken` (autenticação)

### Frontend (Web App)

* Next.js 15+ (App Router)
* TailwindCSS + ShadCN/UI
* Context API para autenticação
* React Hook Form + Zod
* Axios com interceptors
* Design responsivo focado em dispositivos móveis

## Arquitetura do Projeto

Monorepo com frontend e backend separados:

```
galera-do-volei/
├── backend/
│   ├── src/
│   │   ├── application/    # Regras de negócio
│   │   ├── domain/         # Contratos e interfaces
│   │   ├── persistence/    # Prisma e banco de dados
│   │   ├── presentation/   # Controllers, rotas e middlewares
│   │   └── shared/         # DTOs e erros customizados
│   ├── tests/              # Testes de integração
│   └── prisma/             # Schema e migrations
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router (páginas)
│   │   ├── components/      # Componentes de UI
│   │   ├── context/         # Estado global
│   │   └── services/        # Axios e integrações
└── docs/                    # Documentação do projeto
```

## Uso de Inteligência Artificial

A IA foi usada como **ferramenta de apoio**, sem substituir autoria humana.

* Frontend: auxílio em componentes complexos com Tailwind e layout responsivo
* Backend: geração de boilerplate para testes repetitivos
* Documentação: organização e formatação técnica

Todo código foi revisado, tipado e integrado à arquitetura do projeto.

## Como Executar

### Pré-requisitos

* Node.js v18 ou superior
* NPM ou Yarn

### Backend

```bash
cd backend
npm install

npx prisma migrate dev
npm run dev
```

Servidor em `http://localhost:3333`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Testes Automatizados

Testes de integração cobrindo autenticação, inscrições, check-in e fluxo social.

```bash
cd backend
npm test -- -i
```

A flag `-i` evita conflitos no SQLite.

## Documentação Adicional

* **[DEV_LOG.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/docs/DEV_LOG.md)**: Diário de Bordo (Dev Log)
* **[ARCHITECTURE.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/docs/ARCHITECTURE.md)**: Documentação de Arquitetura
* **[TEST_CHECKLIST.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/docs/TEST_CHECKLIST.md)**: Checklist de Testes
* **[PLANNING_UPGRADE.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/docs/PLANNING_UPGRADE.md)**: Plano de Upgrade do Sistema

**Desenvolvido por Lincoln Matheus**
