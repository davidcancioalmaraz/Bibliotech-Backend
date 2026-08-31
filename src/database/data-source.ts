import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { DataSource, type DataSourceOptions } from 'typeorm'

if (existsSync('.env')) process.loadEnvFile('.env')

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'database',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'bibliotech-password',
  database: process.env.DB_DATABASE ?? 'postgres',
  synchronize: false,
  migrationsRun: process.env.DB_MIGRATIONS_RUN === 'true',
  logging: process.env.DB_LOGGING === 'true',
  migrations: process.env.VITEST
    ? []
    : [join(import.meta.dirname, 'migrations', '*.{ts,js}')],
}

export default new DataSource(dataSourceOptions)
