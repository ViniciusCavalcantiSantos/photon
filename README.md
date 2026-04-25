# Photon Cloud

A full-stack photo-management platform with AI-powered face recognition.  
It is composed of three services — a **Next.js** front-end, a **Laravel** API, and a lightweight **Go SSE** microservice — all orchestrated with Docker Compose.

---

🌐 **Language:** **English** | [Português (BR)](./README.pt.md)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Directory Structure](#directory-structure)
- [Running Locally](#running-locally)
  - [Prerequisites](#prerequisites)
  - [1 — Clone & enter the project](#1--clone--enter-the-project)
  - [2 — (Optional) Override defaults](#2--optional-override-defaults)
  - [3 — Configure Face Recognition](#3--configure-face-recognition)
  - [4 — Start all services](#4--start-all-services)
  - [5 — Access the application](#5--access-the-application)
- [Service Ports](#service-ports)
- [Useful Commands](#useful-commands)
  - [Updating Frontend Types from Swagger](#updating-frontend-types-from-swagger)
- [API Documentation](#api-documentation)

---

## Tech Stack

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Front-end   | Next.js 16, React 19, Ant Design, TailwindCSS |
| Back-end    | Laravel 12, PHP 8.2, Laravel Sanctum, Laravel Scout |
| SSE service | Go                                      |
| Database    | MySQL 8                                 |
| Cache/Queue | Redis 8                                 |
| Storage     | MinIO (S3-compatible, local dev)        |
| Mail (dev)  | Mailpit                                 |
| Face AI     | AWS Rekognition                         |

---

## Directory Structure

```
photon/
├── .env.example              # Root-level Docker overrides (optional)
├── docker-compose.yml        # Development orchestration
├── docker-compose.prod.yml   # Production overrides
│
├── client/                   # Next.js front-end
│   ├── src/
│   │   ├── app/              # Next.js App Router pages & layouts
│   │   ├── assets/           # Static assets (images, fonts, …)
│   │   ├── components/       # Shared UI components
│   │   ├── contexts/         # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── i18n/             # Internationalisation (i18next)
│   │   ├── lib/              # Utility libraries & API client
│   │   └── types/            # TypeScript types & OpenAPI-generated types
│   ├── public/               # Public static files
│   ├── .env.example          # Client environment variables
│   └── package.json
│
├── server/                   # Laravel API
│   ├── app/
│   │   ├── Helpers/          # Global helper functions
│   │   ├── Http/             # Controllers, Middleware, Requests, Resources
│   │   ├── Jobs/             # Queued jobs (e.g. image sorting, face indexing)
│   │   ├── Mail/             # Mail classes
│   │   ├── Models/           # Eloquent models
│   │   ├── Notifications/    # Laravel notifications
│   │   ├── Observers/        # Model observers
│   │   ├── OpenApi/          # OpenAPI/Swagger schema definitions
│   │   ├── Policies/         # Authorization policies
│   │   ├── Providers/        # Service providers
│   │   └── Services/         # Business-logic services (incl. ImageAnalysis)
│   ├── config/               # Laravel configuration files
│   ├── database/             # Migrations, factories, seeders
│   ├── docker/               # Dockerfile & Nginx configs for the server
│   ├── lang/                 # Locale files
│   ├── resources/            # Blade views / front-end entry points
│   ├── routes/               # API & web route definitions
│   ├── storage/              # Logs, cache, uploaded files
│   ├── tests/                # Pest / PHPUnit test suites
│   ├── .env.example          # Server environment variables
│   └── composer.json
│
└── sse/                      # Go SSE microservice
    ├── main.go               # HTTP + Redis Pub/Sub server
    ├── go.mod
    └── Dockerfile
```

---

## Running Locally

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 with the **Compose** plugin
- Git

That's it — PHP, Node.js and Go are **not** required on your host machine.

---

### 1 — Clone & enter the project

```bash
git clone <repository-url> photon
cd photon
```

---

### 2 — (Optional) Override defaults

The `docker-compose.yml` ships with sensible defaults for every service.  
A root `.env` file is only needed if you want to change ports or passwords:

```bash
cp .env.example .env
# Edit .env and uncomment / modify only the values you need
```

Available overrides:

| Variable                 | Default              | Description                    |
|--------------------------|----------------------|--------------------------------|
| `FORWARD_APP_PORT`       | `8000`               | Laravel API port               |
| `FORWARD_CLIENT_PORT`    | `3000`               | Next.js client port            |
| `FORWARD_SSE_PORT`       | `8080`               | SSE microservice port          |
| `FORWARD_MAILPIT_PORT`   | `8025`               | Mailpit web UI port            |
| `FORWARD_MINIO_PORT`     | `9000`               | MinIO S3 API port              |
| `FORWARD_MINIO_CONSOLE_PORT` | `9001`           | MinIO console port             |
| `DB_ROOT_PASSWORD`       | `root`               | MySQL root password            |
| `DB_DATABASE`            | `photon`             | Database name                  |
| `DB_USERNAME`            | `photon`             | Database user                  |
| `DB_PASSWORD`            | `12345678`           | Database password              |
| `REDIS_PASSWORD`         | `12345678`           | Redis password                 |
| `MINIO_ROOT_USER`        | `minio`              | MinIO access key               |
| `MINIO_ROOT_PASSWORD`    | `minio12345`         | MinIO secret key               |
| `SSE_ALLOWED_ORIGINS`    | `http://localhost:3000` | CORS allowed origins for SSE |

---

### 3 — Configure Face Recognition

> **This is the only mandatory manual step.**  
> All other configuration has working defaults for local development.

Face recognition is powered by **AWS Rekognition**. You must supply valid AWS credentials so that the image-sorting jobs can index and search faces.

Open `server/.env.example`, copy it to `server/.env`, and fill in the `REKOGNITION_*` variables:

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set the following required variables:

```dotenv
# ── AWS Rekognition (required for face recognition) ────────────────────
REKOGNITION_REGION=us-east-1          # AWS region where your collection lives
REKOGNITION_KEY=YOUR_AWS_ACCESS_KEY   # AWS IAM access key ID
REKOGNITION_SECRET=YOUR_AWS_SECRET    # AWS IAM secret access key
REKOGNITION_COLLECTION_ID=photon-faces-dev  # Rekognition collection name (create it first)

# Set to true and provide bucket details if you want Rekognition to read
# images directly from S3 instead of uploading raw bytes
REKOGNITION_USE_S3_OBJECT=false
REKOGNITION_DISK=         # e.g. s3  (only needed when USE_S3_OBJECT=true)
REKOGNITION_BUCKET=       # S3 bucket name (only needed when USE_S3_OBJECT=true)
```

**Creating the Rekognition collection** (one-time setup, replace the values as needed):

```bash
aws rekognition create-collection \
  --collection-id photon-faces-dev \
  --region us-east-1
```

> All other variables in `server/.env` (database, Redis, MinIO, mail) are pre-filled with values that match the Docker Compose defaults and require **no changes** for local development.

---

### 4 — Start all services

```bash
docker compose up
```

On the first run Docker will:
1. Build the PHP-FPM, queue-worker, scheduler, and SSE images.
2. Wait for MySQL and Redis to be healthy.
3. Automatically run `composer install`, `php artisan key:generate`, and `php artisan migrate` inside the `app` container.
4. Create the `photon-dev` MinIO bucket.

Subsequent starts are much faster because images are cached.

---

### 5 — Access the application

| Service          | URL                                  |
|------------------|--------------------------------------|
| **Client**       | http://localhost:3000                |
| **API**          | http://localhost:8000                |
| **API Docs**     | http://localhost:8000/api/documentation |
| **SSE**          | http://localhost:8080                |
| **Mailpit**      | http://localhost:8025                |
| **MinIO Console**| http://localhost:9001                |

> **Note:** The Next.js dev server is **not** started by Docker Compose.  
> Run it separately on your host machine (see [Useful Commands](#useful-commands)).

---

## Service Ports

| Container    | Internal Port | Forwarded to host |
|--------------|---------------|-------------------|
| `webserver`  | 80            | 8000              |
| `sse`        | 8080          | 8080              |
| `mailpit`    | 8025          | 8025              |
| `minio`      | 9000 / 9001   | 9000 / 9001       |

MySQL and Redis are **not** exposed to the host by default.

---

## Useful Commands

### Front-end (Next.js)

```bash
# Install dependencies
cd client && pnpm install

# Start development server
pnpm dev

# Regenerate TypeScript types from the OpenAPI spec (see section below)
pnpm update:types
```

### Updating Frontend Types from Swagger

The TypeScript types used by the client are auto-generated from the backend's OpenAPI spec.  
Run this whenever you change a controller, resource, or request class on the Laravel side.

**One-command shortcut** (runs both steps automatically):

```bash
cd client && pnpm update:types
```

This script does the following two steps in sequence:

**Step 1 — Regenerate the OpenAPI JSON from PHP annotations**

> Requires PHP available locally **or** run it inside Docker (preferred):

```bash
# Inside Docker (recommended)
docker compose exec app php artisan l5-swagger:generate

# Or locally (if PHP is installed on your host)
cd server && php artisan l5-swagger:generate
```

This produces/updates `server/storage/api-docs/api-docs.json`.

**Step 2 — Generate TypeScript types from the JSON spec**

```bash
cd client && npx openapi-typescript ../server/storage/api-docs/api-docs.json -o src/types/api.d.ts
```

Or, using the shortcut already defined in `package.json` (skips Step 1 if the JSON is already up to date):

```bash
cd client && pnpm update:types
```

This overwrites `client/src/types/api.d.ts` with fresh types that mirror the current API surface.

> **Tip:** If you only changed the frontend and not the Laravel annotations, you can skip Step 1 and just re-run Step 2 with the existing JSON file.

### Back-end (Laravel inside Docker)

```bash
# Run Artisan commands
docker compose exec app php artisan <command>

# Run migrations
docker compose exec app php artisan migrate

# Open a shell inside the container
docker compose exec app bash

# Run tests
docker compose exec app php artisan test
```

### Composer (via the utility container)

```bash
docker compose run --rm composer require <package>
```

---

## API Documentation

Interactive Swagger UI is available at **http://localhost:8000/api/documentation**.

To regenerate the OpenAPI spec after changing PHP annotations:

```bash
docker compose exec app php artisan l5-swagger:generate
```
