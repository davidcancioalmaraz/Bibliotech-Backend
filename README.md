# BiblioTech Backend

Backend for a library management system for books and loans.

## Stack

| Layer     | Choice                                 |
|-----------|----------------------------------------|
| Runtime   | Node.js 24                             |
| Framework | NestJS 12 (Express)                    |
| Language  | TypeScript 6                           |
| Database  | PostgreSQL 18 with TypeORM 1           |
| Tests     | Vitest 4 (unit and e2e)                |
| Tooling   | oxlint, Prettier, pm2 in the container |

The project is **pure ESM** (`"type": "module"`, `module: nodenext`). Relative imports therefore carry a `.js` extension
even when the file on disk is a `.ts`
one:

```ts
import { BookModule } from './book/book.module.js'
```

## Requirements

- Node.js 24 or newer
- Docker with Docker Compose

## Getting started

### With Docker Compose

Brings up the API and the database. Pending migrations are applied on start.

```shell
cp .env.example .env
docker compose up -d
```

The API listens on http://localhost:3000.

### Locally, with the database in Docker

```shell
npm install
cp .env.example .env
docker compose up -d database
npm run migration:run
npm run start:dev
```

## Environment variables

Copy `.env.example` to `.env`. The file is read by `src/database/data-source.ts`
through Node's native `process.loadEnvFile()`, so no `dotenv` dependency is involved.

| Variable            | Default               | Description                               |
|---------------------|-----------------------|-------------------------------------------|
| `PORT`              | `3000`                | Port the application listens on           |
| `DB_HOST`           | `localhost`           | Database host — `database` inside Compose |
| `DB_PORT`           | `5432`                | Database port                             |
| `DB_USERNAME`       | `postgres`            | Database user                             |
| `DB_PASSWORD`       | `bibliotech-password` | Database password                         |
| `DB_DATABASE`       | `postgres`            | Database name                             |
| `DB_MIGRATIONS_RUN` | `false`               | Apply pending migrations on start         |
| `DB_LOGGING`        | `false`               | Log every SQL statement                   |

`POSTGRES_VERSION` (default `18.6-alpine`) and `TZ` (default `America/La_Paz`)
are only consumed by `docker-compose.yml`.

## Project structure

```
src/
  main.ts                 Bootstrap, listens on PORT
  app.module.ts           Root module, registers TypeOrmModule.forRoot
  book/
    book.controller.ts    HTTP routes for /book
    book.service.ts       Business logic, injects Repository<Book>
    book.module.ts        Registers TypeOrmModule.forFeature([Book])
    dto/                  Request payloads
    entities/             Book entity
  database/
    data-source.ts        Connection config, shared by the app and the CLI
    migrations/           Migration files
test/                     End-to-end tests
```

## API

| Method   | Route       | Description   |
|----------|-------------|---------------|
| `POST`   | `/book`     | Create a book |
| `GET`    | `/book`     | List books    |
| `GET`    | `/book/:id` | Get a book    |
| `PATCH`  | `/book/:id` | Update a book |
| `DELETE` | `/book/:id` | Delete a book |

## Data model

`Book` (`src/book/entities/book.entity.ts`):

| Column        | Type        | Notes                                                           |
|---------------|-------------|-----------------------------------------------------------------|
| `id`          | integer     | Primary key, auto-generated                                     |
| `title`       | varchar     | Required                                                        |
| `description` | varchar     | Required                                                        |
| `isbn`        | varchar     | Optional                                                        |
| `code`        | varchar     | Required, unique                                                |
| `author`      | varchar     | Optional                                                        |
| `category`    | varchar     | Optional                                                        |
| `year`        | integer     | Optional                                                        |
| `publisher`   | varchar     | Optional                                                        |
| `language`    | varchar     | Defaults to `es`                                                |
| `pages`       | integer     | Optional                                                        |
| `status`      | enum        | `available`, `on-loan`, `under-repair`. Defaults to `available` |
| `created_at`  | timestamptz | Set on insert                                                   |
| `updated_at`  | timestamptz | Set on update                                                   |

## Database

The connection lives in `src/database/data-source.ts`, the single source of truth shared by the application
(`TypeOrmModule.forRoot`) and the TypeORM CLI.

Two things to keep in mind when working on it:

- `synchronize` is always disabled. The schema is owned by the migrations.
- Entities are registered explicitly in the `entities` array. A new entity has to be added there before TypeORM picks it
  up.

### Migrations

Migration files live in `src/database/migrations/` and are compiled into `dist`
by `npm run build`.

- Generate a migration from the difference between the entities and the database

  ```shell
  npm run migration:generate --name=CreateBookTable
  ```

- Create an empty migration

  ```shell
  npm run migration:create --name=SeedInitialData
  ```

- Apply the pending migrations

  ```shell
  npm run migration:run
  ```

- Revert the last applied migration

  ```shell
  npm run migration:revert
  ```

- List the migrations and their state

  ```shell
  npm run migration:show
  ```

> `--name=` is required by `migration:generate` and `migration:create`. Without
> it the command stops with `Missing --name=<MigrationName>` instead of writing
> the file to the wrong place.

Migration files must stay inside `src/database/migrations/`. That directory is the only path the data source looks at,
so a file left anywhere else is silently never executed.

Any other CLI command is available through the `typeorm` script, which already points at the data source:

```shell
npm run typeorm -- migration:generate src/database/migrations/CreateBookTable
```

Under Docker Compose the backend applies the pending migrations on start, through `DB_MIGRATIONS_RUN=true`.

## Scripts

| Script                | Description                                     |
|-----------------------|-------------------------------------------------|
| `npm run build`       | Compile to `dist`                               |
| `npm start`           | Start the application                           |
| `npm run start:dev`   | Start in watch mode                             |
| `npm run start:debug` | Start in watch mode with the debugger           |
| `npm run start:prod`  | Run the compiled build                          |
| `npm run format`      | Format with Prettier                            |
| `npm run lint`        | Lint with oxlint                                |
| `npm test`            | Run the unit tests                              |
| `npm run test:watch`  | Unit tests in watch mode                        |
| `npm run test:cov`    | Unit tests with coverage                        |
| `npm run test:debug`  | Unit tests with the debugger                    |
| `npm run test:e2e`    | Run the end-to-end tests                        |
| `npm run typeorm`     | TypeORM CLI, already pointed at the data source |
| `npm run migration:*` | See [Migrations](#migrations)                   |

## Docker

`docker-compose.yml` defines two services:

- **database** — PostgreSQL, published on `127.0.0.1:5432`, persisted in the
  `database_data` volume, with a `pg_isready` healthcheck.
- **bibliotech-backend** — the API, published on `PORT` (`3000` by default). It waits for the database to be healthy and
  applies pending migrations on start.

Changing `DB_USERNAME` or `DB_DATABASE` on an existing installation requires recreating the volume:

```shell
docker compose down -v
docker compose up -d
```

PostgreSQL only runs `initdb` on an empty data directory, so without that step the new user or database is never created
and the application cannot connect.
