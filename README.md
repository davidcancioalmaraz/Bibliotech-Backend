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

CORS is enabled for any origin. Set `CORS_ORIGIN` to a comma-separated list (`https://app.example.com,http://localhost:5173`) to restrict it.

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

| Method   | Route        | Description           | Access   |
|----------|--------------|-----------------------|----------|
| `POST`   | `/books`     | Create a book         | Admin    |
| `GET`    | `/books`     | List books, paginated | Any user |
| `GET`    | `/books/:id` | Get a book            | Any user |
| `PATCH`  | `/books/:id` | Update a book         | Admin    |
| `DELETE` | `/books/:id` | Delete a book         | Admin    |

| Method   | Route        | Description                 | Access |
|----------|--------------|-----------------------------|--------|
| `POST`   | `/users`     | Create a user               | Admin  |
| `GET`    | `/users`     | List users, paginated       | Admin  |
| `GET`    | `/users/:id` | Get a user                  | Admin  |
| `PATCH`  | `/users/:id` | Update a user               | Admin  |
| `DELETE` | `/users/:id` | Delete a user without loans | Admin  |

| Method   | Route               | Description                                       | Access   |
|----------|---------------------|---------------------------------------------------|----------|
| `POST`   | `/loans`            | Lend an available copy to a user                  | Admin    |
| `GET`    | `/loans`            | List loans, most recently lent first, paginated   | Admin    |
| `GET`    | `/loans/me`         | List my open loans, paginated                     | Any user |
| `GET`    | `/loans/:id`        | Get a loan                                        | Admin    |
| `PATCH`  | `/loans/:id`        | Adjust the dates of an open loan — an extension   | Admin    |
| `POST`   | `/loans/:id/return` | Close the loan and put the copy back on the shelf | Admin    |
| `DELETE` | `/loans/:id`        | Delete a loan; an open one releases its book      | Admin    |

Access is enforced by two guards registered globally, so an endpoint is protected the day it is written: `@Public()`
opts out of authentication, `@Roles(UserRole.ADMIN)` restricts to admins, and no decorator means any valid token.

Authenticate with a seeded user and send the token as a Bearer header:

```shell
curl -X POST localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@bibliotech.test","password":"Bibliotech123"}'

curl localhost:3000/auth/me -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Pagination

The list endpoints — `GET /books`, `GET /users`, `GET /loans` and `GET /loans/me` — take `page` and `limit`, and answer
with a `data` + `meta` envelope rather than a bare array.

| Parameter | Default | Range     |
|-----------|---------|-----------|
| `page`    | `1`     | `>= 1`    |
| `limit`   | `20`    | `1`–`100` |

```shell
curl "localhost:3000/books?page=2&limit=10" -H "Authorization: Bearer $ACCESS_TOKEN"
```

```json
{
  "data": [{ "id": 11, "title": "..." }],
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 137,
    "totalPages": 14,
    "hasPreviousPage": true,
    "hasNextPage": true
  }
}
```

Anything outside those ranges answers `400`, and so does an unknown query parameter — the global `ValidationPipe` runs
with `forbidNonWhitelisted`. Asking for a page past the end is not an error: `data` comes back empty with the `meta`
still filled in.

The shared pieces live in `src/common/`: `PaginationQueryDto` for the parameters, the `paginate()` helper over
`Repository.findAndCount`, and the `@ApiPaginatedResponse()` decorator that documents the envelope in OpenAPI.

**Lending rules.** `/loans` is not plain CRUD: a copy can only be in one person's hands at a time, so anything touching
both tables runs in a transaction. Lending a copy that is not `available` answers `409`, as does returning or editing an
already returned loan. The loan `code` is generated server-side and `dueDate` is derived from `loanedAt` plus a term of
14, 21 or 30 days.

**Who borrows what.** A loan points at a book *and* at the user holding it, so `POST /loans` takes a `userId` alongside
the `bookId`: an unknown one answers `404`, an inactive account `409`. Neither can be changed afterwards — `PATCH
/loans/:id` only moves dates, and handing a copy to someone else is a return followed by a new loan. Both relations are
eager, so every loan travels with its `book` and its `user` embedded; the password never comes along, because the column
is `select: false`. The inverse sides (`Book.loans`, `User.loans`) are not eager and stay out of the responses.

Deleting is the other half of that: the foreign keys are `ON DELETE NO ACTION`, so a book or a user with loans on record
answers `409` rather than cascading the lending history away. An account that should stop borrowing is deactivated with
`isActive: false`, not deleted.

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
fixture file. `user.seeder.ts` mixes both: three fixed users (one `admin`, two `member`) give stable credentials after
every reseed, and `user.factory.ts` adds a handful of generated members on top, so the loan history has enough borrowers
to be worth paging through. Every seeded account shares the password `Bibliotech123`, and a few generated ones come out
`isActive: false` on purpose, so the rule that stops them borrowing has something to reject.

The seeders run in order — books, then users, then loans — because a loan needs both of its parents to exist first.

```shell
npm run seed

# inside Docker Compose
docker compose run --rm seeder
```

The `seeder` service sits behind the `tooling` profile, so `docker compose up` never starts it: it exists only to be
run on demand and exits when the seeding finishes. It reuses the `bibliotech-backend` image, so build it first
(`docker compose build`) or add `--build` to the `run`.

A handful of environment variables tune a run:

| Variable                 | Default         | Description                                                 |
|--------------------------|-----------------|-------------------------------------------------------------|
| `SEED_BOOK_COUNT`        | `25`            | How many books to insert                                    |
| `SEED_USER_COUNT`        | `10`            | Members generated on top of the three fixed users           |
| `SEED_LOAN_MAX_PER_BOOK` | `3`             | Cap on the returned loans in each copy's history            |
| `SEED_FRESH`             | `false`         | Truncate `loans`, `books` and `users` before inserting      |
| `SEED_USER_PASSWORD`     | `Bibliotech123` | Password given to every seeded user                         |
| `SEED_FAKER_SEED`        | —               | Fix faker's seed for a reproducible set of rows             |

```shell
SEED_FRESH=true SEED_BOOK_COUNT=100 npm run seed

# the same, through the tooling service
docker compose run --rm -e SEED_FRESH=true -e SEED_BOOK_COUNT=100 seeder
```

The service passes those variables straight through from your shell or `.env`, and leaves them unset otherwise so the
seeder's own defaults apply.

The seeder is **not** idempotent by design: running it again appends another batch of random books. Use
`SEED_FRESH=true` to reset instead of accumulating.
