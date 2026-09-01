# BiblioTech Backend

Backend for a library management system for books and loans.

## Stack

| Layer     | Choice                                 |
|-----------|----------------------------------------|
| Runtime   | Node.js 24                             |
| Framework | NestJS 12 (Express)                    |
| Language  | TypeScript 6                           |
| Database  | PostgreSQL 18 with TypeORM 1           |
| Auth      | JWT with `@nestjs/passport`            |
| Docs      | OpenAPI 3 with `@nestjs/swagger` 12    |
| Tests     | Vitest 4 (unit and e2e)                |
| Tooling   | oxlint, Prettier, Docker Compose       |

The project is **pure ESM** (`"type": "module"`), so relative imports carry a `.js` extension even when the file on disk
is a `.ts` one.

## Requirements

- Node.js 24 or newer
- Docker with Docker Compose

## Getting started

Copy the environment file first — `JWT_SECRET` has no default and the app refuses to start without it.

```shell
cp .env.example .env
```

### Docker Compose

Brings up the API and the database. Pending migrations are applied on start.

```shell
docker compose up -d
```

### npm

Runs the API locally, with the database in Docker.

```shell
npm install
docker compose up -d database
npm run migration:run
npm run start:dev
```

Either way the API listens on http://localhost:3000 and its documentation on http://localhost:3000/docs.

## Project structure

```
src/
  main.ts             Bootstrap: global ValidationPipe, Swagger, listens on PORT
  app.module.ts       Root module: config, TypeORM and the global guards
  auth/               Login, JWT strategy, guards and decorators
  book/               /books — controller, service, DTOs and Book entity
  loan/               /loans — lending rules and Loan entity
  user/               /users — controller, service, DTOs and User entity
  database/
    data-source.ts    Connection config, shared by the app and the TypeORM CLI
    migrations/       Migration files
    seed.ts           Entry point of `npm run seed`
    seeds/            Seeders, factories and the Spanish locale
test/                 End-to-end tests
```

Each feature module follows the same shape: `*.controller.ts`, `*.service.ts`, `*.module.ts`, `dto/` and `entities/`.

## API

The live and authoritative reference is **http://localhost:3000/docs** (raw document at `/docs-json`). To call a
protected route from Swagger UI, run `POST /auth/login`, copy the `accessToken` and paste it under **Authorize**.

| Method | Route         | Description                    | Access   |
|--------|---------------|--------------------------------|----------|
| `POST` | `/auth/login` | Exchange credentials for a JWT | Public   |
| `GET`  | `/auth/me`    | Current user behind the token  | Any user |

| Method   | Route        | Description   | Access   |
|----------|--------------|---------------|----------|
| `POST`   | `/books`     | Create a book | Admin    |
| `GET`    | `/books`     | List books    | Any user |
| `GET`    | `/books/:id` | Get a book    | Any user |
| `PATCH`  | `/books/:id` | Update a book | Admin    |
| `DELETE` | `/books/:id` | Delete a book | Admin    |

| Method   | Route        | Description   | Access |
|----------|--------------|---------------|--------|
| `POST`   | `/users`     | Create a user | Admin  |
| `GET`    | `/users`     | List users    | Admin  |
| `GET`    | `/users/:id` | Get a user    | Admin  |
| `PATCH`  | `/users/:id` | Update a user | Admin  |
| `DELETE` | `/users/:id` | Delete a user | Admin  |

| Method   | Route               | Description                                       | Access |
|----------|---------------------|---------------------------------------------------|--------|
| `POST`   | `/loans`            | Lend an available copy                            | Admin  |
| `GET`    | `/loans`            | List loans, most recently lent first              | Admin  |
| `GET`    | `/loans/:id`        | Get a loan                                        | Admin  |
| `PATCH`  | `/loans/:id`        | Adjust the dates of an open loan — an extension   | Admin  |
| `POST`   | `/loans/:id/return` | Close the loan and put the copy back on the shelf | Admin  |
| `DELETE` | `/loans/:id`        | Delete a loan; an open one releases its book      | Admin  |

Access is enforced by two guards registered globally, so an endpoint is protected the day it is written: `@Public()`
opts out of authentication, `@Roles(UserRole.ADMIN)` restricts to admins, and no decorator means any valid token.

Authenticate with a seeded user and send the token as a Bearer header:

```shell
curl -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@bibliotech.test","password":"Bibliotech123"}'

curl localhost:3000/auth/me -H "Authorization: Bearer $ACCESS_TOKEN"
```

**Lending rules.** `/loans` is not plain CRUD: a copy can only be in one person's hands at a time, so anything touching
both tables runs in a transaction. Lending a copy that is not `available` answers `409`, as does returning or editing an
already returned loan. The loan `code` is generated server-side and `dueDate` is derived from `loanedAt` plus a term of
14, 21 or 30 days.

## Migrations

Migration files live in `src/database/migrations/` — the only path the data source looks at. `synchronize` is always
disabled; the schema is owned by the migrations.

```shell
npm run migration:generate --name=CreateBookTable   # generate from the entity diff
npm run migration:create --name=SeedInitialData     # create an empty migration
npm run migration:run                               # apply pending migrations
npm run migration:revert                            # revert the last one
npm run migration:show                              # list them and their state
```

`--name=` is required by `migration:generate` and `migration:create`. Under Docker Compose the backend applies pending
migrations on start, through `DB_MIGRATIONS_RUN=true`.

## Seeders

Seeding uses [`typeorm-extension`](https://www.npmjs.com/package/typeorm-extension) with the standard *factory +
seeder* pair, and rows are generated with [`@faker-js/faker`](https://fakerjs.dev) in Spanish — there is no static
fixture file. `user.seeder.ts` has no factory on purpose: three fixed users (one `admin`, two `member`) give stable
credentials after every reseed, all sharing the password `Bibliotech123`.

```shell
npm run seed

# inside Docker Compose
docker compose exec bibliotech-backend node database/seed.js
```

Four environment variables tune a run:

| Variable             | Default         | Description                                            |
|----------------------|-----------------|--------------------------------------------------------|
| `SEED_BOOK_COUNT`    | `25`            | How many books to insert                               |
| `SEED_FRESH`         | `false`         | Truncate `loan`, `book` and `user` before inserting    |
| `SEED_USER_PASSWORD` | `Bibliotech123` | Password given to the three seeded users               |
| `SEED_FAKER_SEED`    | —               | Fix faker's seed for a reproducible set of books        |

```shell
SEED_FRESH=true SEED_BOOK_COUNT=100 npm run seed
```

The seeder is **not** idempotent by design: running it again appends another batch of random books. Use
`SEED_FRESH=true` to reset instead of accumulating.
