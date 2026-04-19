# Photon Cloud

Uma plataforma completa de gerenciamento de fotos com reconhecimento facial por IA.  
É composta por três serviços — um front-end **Next.js**, uma API **Laravel** e um microserviço leve **Go SSE** — todos orquestrados com Docker Compose.

---

🌐 **Idioma:** [English](./README.md) | **Português (BR)**

---

## Índice

- [Tecnologias](#tecnologias)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Executando Localmente](#executando-localmente)
  - [Pré-requisitos](#pré-requisitos)
  - [1 — Clonar e entrar no projeto](#1--clonar-e-entrar-no-projeto)
  - [2 — (Opcional) Sobrescrever padrões](#2--opcional-sobrescrever-padrões)
  - [3 — Configurar o Reconhecimento Facial](#3--configurar-o-reconhecimento-facial)
  - [4 — Iniciar todos os serviços](#4--iniciar-todos-os-serviços)
  - [5 — Acessar a aplicação](#5--acessar-a-aplicação)
- [Portas dos Serviços](#portas-dos-serviços)
- [Comandos Úteis](#comandos-úteis)
- [Documentação da API](#documentação-da-api)

---

## Tecnologias

| Camada      | Tecnologia                              |
|-------------|-----------------------------------------|
| Front-end   | Next.js 16, React 19, Ant Design, TailwindCSS |
| Back-end    | Laravel 12, PHP 8.2, Laravel Sanctum, Laravel Scout |
| Serviço SSE | Go                                      |
| Banco de dados | MySQL 8                              |
| Cache/Fila  | Redis 8                                 |
| Armazenamento | MinIO (compatível com S3, dev local)  |
| E-mail (dev)| Mailpit                                 |
| IA Facial   | AWS Rekognition                         |

---

## Estrutura de Diretórios

```
photon-2/
├── .env.example              # Variáveis raiz do Docker (opcionais)
├── docker-compose.yml        # Orquestração do ambiente de desenvolvimento
├── docker-compose.prod.yml   # Sobrescritas de produção
│
├── client/                   # Front-end Next.js
│   ├── src/
│   │   ├── app/              # Páginas e layouts do App Router do Next.js
│   │   ├── assets/           # Recursos estáticos (imagens, fontes, …)
│   │   ├── components/       # Componentes de UI reutilizáveis
│   │   ├── contexts/         # Provedores de contexto React
│   │   ├── hooks/            # Hooks React customizados
│   │   ├── i18n/             # Internacionalização (i18next)
│   │   ├── lib/              # Bibliotecas utilitárias e cliente de API
│   │   └── types/            # Tipos TypeScript e tipos gerados pelo OpenAPI
│   ├── public/               # Arquivos estáticos públicos
│   ├── .env.example          # Variáveis de ambiente do cliente
│   └── package.json
│
├── server/                   # API Laravel
│   ├── app/
│   │   ├── Helpers/          # Funções utilitárias globais
│   │   ├── Http/             # Controllers, Middleware, Requests, Resources
│   │   ├── Jobs/             # Jobs em fila (ex: ordenação de imagens, indexação facial)
│   │   ├── Mail/             # Classes de e-mail
│   │   ├── Models/           # Models Eloquent
│   │   ├── Notifications/    # Notificações Laravel
│   │   ├── Observers/        # Observers de models
│   │   ├── OpenApi/          # Definições de esquema OpenAPI/Swagger
│   │   ├── Policies/         # Políticas de autorização
│   │   ├── Providers/        # Service providers
│   │   └── Services/         # Serviços de lógica de negócio (incl. ImageAnalysis)
│   ├── config/               # Arquivos de configuração do Laravel
│   ├── database/             # Migrations, factories, seeders
│   ├── docker/               # Dockerfile e configs do Nginx para o servidor
│   ├── lang/                 # Arquivos de localização
│   ├── resources/            # Views Blade / entry points do front-end
│   ├── routes/               # Definições de rotas API e web
│   ├── storage/              # Logs, cache, arquivos enviados
│   ├── tests/                # Suites de teste Pest / PHPUnit
│   ├── .env.example          # Variáveis de ambiente do servidor
│   └── composer.json
│
└── sse/                      # Microserviço SSE em Go
    ├── main.go               # Servidor HTTP + Redis Pub/Sub
    ├── go.mod
    └── Dockerfile
```

---

## Executando Localmente

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 com o plugin **Compose**
- Git

Só isso — PHP, Node.js e Go **não são necessários** na sua máquina host.

---

### 1 — Clonar e entrar no projeto

```bash
git clone <url-do-repositório> photon-2
cd photon-2
```

---

### 2 — (Opcional) Sobrescrever padrões

O `docker-compose.yml` já vem com padrões sensatos para todos os serviços.  
Um arquivo `.env` na raiz só é necessário se você quiser mudar portas ou senhas:

```bash
cp .env.example .env
# Edite o .env e descomente / altere apenas os valores necessários
```

Variáveis disponíveis para sobrescrita:

| Variável                     | Padrão               | Descrição                          |
|------------------------------|----------------------|------------------------------------|
| `FORWARD_APP_PORT`           | `8000`               | Porta da API Laravel               |
| `FORWARD_CLIENT_PORT`        | `3000`               | Porta do cliente Next.js           |
| `FORWARD_SSE_PORT`           | `8080`               | Porta do microserviço SSE          |
| `FORWARD_MAILPIT_PORT`       | `8025`               | Porta da interface web do Mailpit  |
| `FORWARD_MINIO_PORT`         | `9000`               | Porta da API S3 do MinIO           |
| `FORWARD_MINIO_CONSOLE_PORT` | `9001`               | Porta do console do MinIO          |
| `DB_ROOT_PASSWORD`           | `root`               | Senha root do MySQL                |
| `DB_DATABASE`                | `photon`             | Nome do banco de dados             |
| `DB_USERNAME`                | `photon`             | Usuário do banco de dados          |
| `DB_PASSWORD`                | `12345678`           | Senha do banco de dados            |
| `REDIS_PASSWORD`             | `12345678`           | Senha do Redis                     |
| `MINIO_ROOT_USER`            | `minio`              | Chave de acesso do MinIO           |
| `MINIO_ROOT_PASSWORD`        | `minio12345`         | Chave secreta do MinIO             |
| `SSE_ALLOWED_ORIGINS`        | `http://localhost:3000` | Origens CORS permitidas para o SSE |

---

### 3 — Configurar o Reconhecimento Facial

> **Esta é a única etapa manual obrigatória.**  
> Toda outra configuração possui padrões funcionais para o desenvolvimento local.

O reconhecimento facial é alimentado pelo **AWS Rekognition**. Você deve fornecer credenciais AWS válidas para que os jobs de ordenação de imagens possam indexar e buscar rostos.

Copie o arquivo de exemplo e preencha as variáveis `REKOGNITION_*`:

```bash
cp server/.env.example server/.env
```

Edite `server/.env` e configure as seguintes variáveis obrigatórias:

```dotenv
# ── AWS Rekognition (obrigatório para o reconhecimento facial) ──────────
REKOGNITION_REGION=us-east-1            # Região AWS onde sua coleção está
REKOGNITION_KEY=SUA_AWS_ACCESS_KEY      # ID da chave de acesso IAM da AWS
REKOGNITION_SECRET=SEU_AWS_SECRET       # Chave secreta IAM da AWS
REKOGNITION_COLLECTION_ID=photon-faces-dev  # Nome da coleção Rekognition (crie antes)

# Defina como true e forneça os detalhes do bucket se quiser que o Rekognition
# leia imagens diretamente do S3 em vez de enviar bytes brutos
REKOGNITION_USE_S3_OBJECT=false
REKOGNITION_DISK=         # ex: s3  (necessário apenas quando USE_S3_OBJECT=true)
REKOGNITION_BUCKET=       # Nome do bucket S3 (necessário apenas quando USE_S3_OBJECT=true)
```

**Criando a coleção no Rekognition** (configuração única — substitua os valores conforme necessário):

```bash
aws rekognition create-collection \
  --collection-id photon-faces-dev \
  --region us-east-1
```

> Todas as outras variáveis em `server/.env` (banco de dados, Redis, MinIO, e-mail) já estão preenchidas com valores compatíveis com os padrões do Docker Compose e **não precisam ser alteradas** para desenvolvimento local.

---

### 4 — Iniciar todos os serviços

```bash
docker compose up
```

Na primeira execução, o Docker irá:
1. Fazer o build das imagens PHP-FPM, worker de fila, scheduler e SSE.
2. Aguardar MySQL e Redis ficarem saudáveis.
3. Rodar automaticamente `composer install`, `php artisan key:generate` e `php artisan migrate` dentro do container `app`.
4. Criar o bucket `photon-dev` no MinIO.

As execuções seguintes são bem mais rápidas porque as imagens ficam em cache.

---

### 5 — Acessar a aplicação

| Serviço          | URL                                  |
|------------------|--------------------------------------|
| **Cliente**      | http://localhost:3000                |
| **API**          | http://localhost:8000                |
| **Docs da API**  | http://localhost:8000/api/documentation |
| **SSE**          | http://localhost:8080                |
| **Mailpit**      | http://localhost:8025                |
| **Console MinIO**| http://localhost:9001                |

> **Atenção:** O servidor de desenvolvimento do Next.js **não é iniciado** pelo Docker Compose.  
> Execute-o separadamente na sua máquina host (veja [Comandos Úteis](#comandos-úteis)).

---

## Portas dos Serviços

| Container    | Porta interna | Exposta no host |
|--------------|---------------|-----------------|
| `webserver`  | 80            | 8000            |
| `sse`        | 8080          | 8080            |
| `mailpit`    | 8025          | 8025            |
| `minio`      | 9000 / 9001   | 9000 / 9001     |

MySQL e Redis **não são expostos** ao host por padrão.

---

## Comandos Úteis

### Front-end (Next.js)

```bash
# Instalar dependências
cd client && pnpm install

# Iniciar servidor de desenvolvimento
pnpm dev

# Regenerar tipos TypeScript a partir da especificação OpenAPI
pnpm update:types
```

### Back-end (Laravel dentro do Docker)

```bash
# Executar comandos Artisan
docker compose exec app php artisan <comando>

# Executar migrations
docker compose exec app php artisan migrate

# Abrir um shell dentro do container
docker compose exec app bash

# Rodar os testes
docker compose exec app php artisan test
```

### Composer (via container utilitário)

```bash
docker compose run --rm composer require <pacote>
```

---

## Documentação da API

A interface interativa do Swagger está disponível em **http://localhost:8000/api/documentation**.

Para regenerar a especificação OpenAPI após alterar as anotações PHP:

```bash
docker compose exec app php artisan l5-swagger:generate
```
