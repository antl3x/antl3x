import {migrate as pmMigrate} from 'postgres-migrations'
import path from 'node:path'
import fs from 'node:fs'
import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module, typeof import('./@api.js')>

export interface module {
  migrate: migrate
  $pullMigrations: () => Promise<
    | {
        id: number
        name: string
        hash: string
        content: string
        executed_at: Date
      }[]
    | {
        _kind_: 'MigrationsTableDoesNotExist'
      }
  >
  getNextMigrationSeq: getNextMigrationSeq
}

/* --------------------------------- migrate -------------------------------- */
type migrate = () => ReturnType<typeof pmMigrate>

/* --------------------------- getNextMigrationSeq -------------------------- */
type getNextMigrationSeq = (from: 'remote' | 'local') => Promise<number>

/* -------------------------------------------------------------------------- */
/*                              Migrations Engine                             */
/* -------------------------------------------------------------------------- */

/* --------------------------------- migrate -------------------------------- */

export const migrate: module['migrate'] = async () => {
  const rootStore = await getRootStore()
  try {
    const dbConfig = {
      client: rootStore.pgClient,

      // Default: false for backwards-compatibility
      // This might change!
      ensureDatabaseExists: true,

      // Default: "postgres"
      // Used when checking/creating "database-name"
      defaultDatabase: rootStore.userConfig.pgConfig.database,
    }

    const migrationsPath = rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH

    const CREATE_MIGRATION_TABLE_sql = `
  CREATE SCHEMA IF NOT EXISTS "_totuna_";

  REVOKE ALL ON SCHEMA _totuna_ FROM PUBLIC;
  REVOKE CREATE ON SCHEMA _totuna_ FROM PUBLIC;
  REVOKE USAGE ON SCHEMA _totuna_ FROM PUBLIC;

  CREATE TABLE IF NOT EXISTS "_totuna_".migrations (
    id integer PRIMARY KEY,
    name varchar(100) UNIQUE NOT NULL,
    hash varchar(40) NOT NULL, -- sha1 hex encoded hash of the file name and contents, to ensure it hasn't been altered since applying the migration
    content text NOT NULL,
    executed_at timestamp DEFAULT current_timestamp
  );`

    const CREATE_MIGRATION_TABLE_filePath = path.join(migrationsPath, '0_create-migrations-table.sql')

    // Create dir if not exists
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, {recursive: true})
    }

    // Create migration table file if not exists
    if (!fs.existsSync(CREATE_MIGRATION_TABLE_filePath)) {
      fs.writeFileSync(CREATE_MIGRATION_TABLE_filePath, CREATE_MIGRATION_TABLE_sql)
    }

    return pmMigrate(dbConfig, migrationsPath)
  } catch (error) {
    throw error
  }
}

/* ----------------------------- $pullMigrations ---------------------------- */

export const $pullMigrations: module['$pullMigrations'] = async () => {
  const rootStore = await getRootStore()

  try {
    // First check if the migrations table exists
    const {rows: tableExists} = await rootStore.pgClient.query(
      'SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)',
      ['_totuna_', 'migrations'],
    )

    if (!tableExists[0].exists) {
      return {_kind_: 'MigrationsTableDoesNotExist'}
    }

    const {rows} = (await rootStore.pgClient.query('SELECT * FROM _totuna_.migrations ORDER BY id ASC')) as any
    if (rows.length === 0) {
      return []
    }
    return rows
  } catch (error) {
    throw error
  }
}

/* --------------------------- getNextMigrationSeq -------------------------- */

export const getNextMigrationSeq: module['getNextMigrationSeq'] = async (from) => {
  const rootStore = await getRootStore()

  if (from === 'remote') {
    try {
      const {rows} = await rootStore.pgClient.query('SELECT id FROM _totuna_.migrations ORDER BY id DESC LIMIT 1')
      return (rows[0]?.id ?? 0) + 1
    } catch (error) {
      console.error(error)
    } finally {
      await rootStore.pgClient.end()
    }
  } else {
    const migrationsPath = rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH
    const files = fs
      .readdirSync(migrationsPath)
      .filter((file) => fs.lstatSync(path.join(migrationsPath, file)).isFile())

    const maxId =
      files.length === 0
        ? 0
        : Math.max(
            ...files.map((file) => {
              const fileNumber = file.split('_')[0]
              const parsedNumber = isNaN(fileNumber as never) ? 0 : parseInt(fileNumber)
              return parsedNumber
            }),
          )

    return maxId + 1
  }
}
