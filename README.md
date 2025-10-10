# Galera do Vôlei 2.0: A Evolução de uma API

## Visão Geral

Bem-vindo à versão 2.0 da API "Galera do Vôlei". Este projeto, iniciado como uma atividade acadêmica, foi refatorado com o objetivo de evoluir de um script monolítico para uma aplicação com arquitetura moderna, escalável e de fácil manutenção.

O foco desta nova versão foi aplicar princípios de design de software como **SOLID** e conceitos da **Clean Architecture** para criar uma base de código robusta, organizada e preparada para futuras expansões.

## A Jornada da Refatoração: Do Monólito à Arquitetura em Camadas

Esta seção documenta o processo de transformação da API, servindo como um estudo de caso prático de refatoração.

### O Ponto de Partida: O Monólito

A versão inicial da API foi desenvolvida em um único arquivo, **[_index_monolitico.ts](https://github.com/LincolnMatheus97/galera-do-volei/blob/main/src/_index_monolitico.ts)**, junto a sua documentação que está no **[_README.md](https://github.com/LincolnMatheus97/galera-do-volei/blob/main/_README.md)**. Este arquivo continha todas as responsabilidades da aplicação:

* Configuração do servidor Express.
* Definição de todas as rotas e endpoints.
* Lógica de manipulação das requisições (lógica de controller).
* Regras de negócio da aplicação (lógica de serviço).
* Persistência de dados em arrays na memória (lógica de repositório).
* Definição de todos os tipos e schemas de dados.

Embora funcional, essa abordagem centralizada apresentava desafios de manutenção, testabilidade e escalabilidade.

### Os Princípios Orientadores

A refatoração foi guiada pelos seguintes princípios e padrões de arquitetura:

1.  **Clean Architecture & DDD:** A principal inspiração foi a separação da aplicação em camadas independentes, cada uma com uma responsabilidade clara, garantindo que a lógica de negócio (domínio) permaneça isolada de detalhes de infraestrutura (como o Express).
2.  **SOLID - Princípio da Responsabilidade Única (SRP):** Cada classe e módulo agora tem um, e apenas um, motivo para mudar. Por exemplo, um `Controller` só muda se a lógica de HTTP mudar, enquanto um `Service` só muda se uma regra de negócio mudar.
3.  **Centralização de Lógica Transversal com Middlewares:** Lógicas que se aplicam a múltiplas rotas, como logging, autenticação e tratamento de erros, foram extraídas para middlewares, evitando a repetição de código e centralizando o controle.

### A Arquitetura Resultante

A aplicação agora está organizada na seguinte estrutura de camadas:

* #### `presentation` (Camada de Apresentação e Infraestrutura Web)
    * **`routes`**: Define os endpoints da API e os verbos HTTP, conectando uma URL a um método de controller.
    * **`controllers`**: Responsáveis por receber a requisição (`Request`) e devolver a resposta (`Response`). Eles orquestram o fluxo, validam os dados de entrada (usando Zod) e invocam os serviços da camada de aplicação.
    * **`middleware`**: Funções que interceptam as requisições para executar lógicas centralizadas, como o `globalErrorMiddleware` que captura todos os erros da aplicação, o `logMiddleware` que registra as chamadas, e o `authMiddleware` que protege as rotas.

* #### `application` (Camada de Aplicação)
    * **`service`**: O coração da aplicação. Contém a lógica de negócio e os casos de uso ("Criar um Jogador", "Aceitar um Convite"). Nesta versão, os serviços também gerenciam a persistência dos dados em memória.
    * **`errors`**: Define classes de erro customizadas (`NotFoundError`, `ConflictError`) que são lançadas pela camada de aplicação, permitindo que a camada de apresentação as traduza para os status HTTP corretos.

* #### `main` ou `domain` (Camada de Domínio)
    * **`index.model.ts`**: O núcleo do sistema. Define as estruturas e tipos de dados fundamentais (`Jogador`, `Partida`, `Convite`), representando as entidades do domínio do problema.

## Jornadas de Usuário e Endpoints

A API foi modelada para atender a duas jornadas de usuário principais, que vão além de um simples CRUD.

### Jornada do Organizador (Moderador)
1.  **Cria uma nova partida** (`POST /partidas`).
2.  **Divulga a partida**, convidando jogadores (`POST /convites`) ou abrindo para inscrições (`POST /partidas/{id}/inscricoes`).
3.  **Gerencia os pedidos de participação**, listando (`GET`), aceitando (`POST /inscricoes/{id}/aceitar`) ou rejeitando (`POST /inscricoes/{id}/rejeitar`) as solicitações.
4.  **Fecha as inscrições** alterando a situação da partida (`PATCH /partidas/{id}`).
5.  **Recebe avaliações** sobre a organização (`POST /partidas/{id}/avaliacoes`).

### Jornada do Jogador (Participante)
1.  **Procura por partidas abertas** (`GET /partidas`).
2.  **Solicita a participação** se inscrevendo (`POST /partidas/{id}/inscricoes`) ou aceita um convite (`POST /convites/{id}/aceitar`).
3.  **Recebe a confirmação** de que foi aceito na partida.
4.  **Avalia a partida e o organizador** (`POST /partidas/{id}/avaliacoes`).

Para uma documentação interativa e detalhada de todos os endpoints, acesse o link no Apidog:
**[https://galeradovolei.apidog.io](https://galeradovolei.apidog.io)**

## Como Executar o Projeto

Siga os passos abaixo para executar a aplicação localmente.

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/LincolnMatheus97/galera-do-volei.git
    cd galera-do-volei
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  O servidor estará rodando em `http://localhost:3333`.
