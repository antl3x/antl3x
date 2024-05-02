/* -------------------------------------------------------------------------- */
/*                             defMigrationsEngine                            */
/* -------------------------------------------------------------------------- */

export interface defMigrationsEngine {
  migrate: migrate;
  getNextMigrationSeq: getNextMigrationSeq;
}

/* --------------------------------- migrate -------------------------------- */
type migrate = () => Promise<void>;

/* --------------------------- getNextMigrationSeq -------------------------- */
type getNextMigrationSeq = (from: "remote" | "local") => Promise<number>;
