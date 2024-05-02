import { getRootStore } from "@rootStore.js";
import { migrate as pmMigrate } from "postgres-migrations";
import path from "node:path";
import fs from "node:fs";
import { defMigrationsEngine } from "./@api.d.js";
import { satisfies } from "_utils_/@utils.js";

satisfies<defMigrationsEngine>()(import("./@api.js"));

/* -------------------------------------------------------------------------- */
/*                              Migrations Engine                             */
/* -------------------------------------------------------------------------- */

/* --------------------------------- migrate -------------------------------- */

export const migrate: defMigrationsEngine["migrate"] = async () => {
  const rootStore = await getRootStore();
  try {
    const dbConfig = {
      client: rootStore.pgClient,

      // Default: false for backwards-compatibility
      // This might change!
      ensureDatabaseExists: true,

      // Default: "postgres"
      // Used when checking/creating "database-name"
      defaultDatabase: rootStore.userConfig.pgConfig.database,
    };

    const migrationsPath = rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH;

    const CREATE_MIGRATION_TABLE_sql = `
  CREATE SCHEMA IF NOT EXISTS "_totuna_";

  REVOKE ALL ON SCHEMA _totuna_ FROM PUBLIC;
  REVOKE CREATE ON SCHEMA _totuna_ FROM PUBLIC;
  REVOKE USAGE ON SCHEMA _totuna_ FROM PUBLIC;

  CREATE TABLE IF NOT EXISTS "_totuna_".migrations (
    id integer PRIMARY KEY,
    name varchar(100) UNIQUE NOT NULL,
    hash varchar(40) NOT NULL, -- sha1 hex encoded hash of the file name and contents, to ensure it hasn't been altered since applying the migration
    executed_at timestamp DEFAULT current_timestamp
  );`;

    const CREATE_MIGRATION_TABLE_filePath = path.join(migrationsPath, "0_create-migrations-table.sql");

    // Create dir if not exists
    if (!fs.existsSync(migrationsPath)) {
      fs.mkdirSync(migrationsPath, { recursive: true });
    }

    // Create migration table file if not exists
    if (!fs.existsSync(CREATE_MIGRATION_TABLE_filePath)) {
      fs.writeFileSync(CREATE_MIGRATION_TABLE_filePath, CREATE_MIGRATION_TABLE_sql);
    }

    await pmMigrate(dbConfig, migrationsPath);
  } catch (error) {
    console.error(error);
  } finally {
    await rootStore.pgClient.end();
  }
};

/* --------------------------- getNextMigrationSeq -------------------------- */

export const getNextMigrationSeq: defMigrationsEngine["getNextMigrationSeq"] = async (from) => {
  const rootStore = await getRootStore();

  if (from === "remote") {
    try {
      const { rows } = await rootStore.pgClient.query("SELECT id FROM _totuna_.migrations ORDER BY id DESC LIMIT 1");
      return (rows[0]?.id ?? 0) + 1;
    } catch (error) {
      console.error(error);
    } finally {
      await rootStore.pgClient.end();
    }
  } else {
    const migrationsPath = rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH;
    const files = fs.readdirSync(migrationsPath);
    const maxId = Math.max(...files.map((file) => parseInt(file.split("_")[0])));
    return maxId + 1;
  }
};
