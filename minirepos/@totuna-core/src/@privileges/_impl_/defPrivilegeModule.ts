import { Pool, QueryResult } from "pg";
import type { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                         Privilege Module Definition                        */
/* -------------------------------------------------------------------------- */
/**
 * # Overview
 * A Privilege Module is a module that represents a specific type of privilege in the PostgreSQL database.
 * It is the heart of the "Privileges Sync" feature.
 */
export interface defPrivilegeModule<StateSchema extends z.ZodSchema> {
  /** A string that represents the URL of the meta file. */
  _metaUrl_: string;

  /** A function that returns the path to the folder where the internal state file is stored. */
  INTERNAL_STATE_FOLDER_PATH: () => Promise<string>;

  /** A function that returns the path to the internal state file. */
  INTERNAL_STATE_FILE_PATH: () => Promise<string>;

  /** A function that returns the path to the public state file. */
  PUBLIC_STATE_FILE_PATH: () => Promise<string>;

  /** A zod schema that represents the shape of the "State" object that mimics the "row" in PostgreSQL. */
  StateSchema: StateSchema;

  /** A function that pulls the privilege state from the database. */
  pullQuery: (dbQuery: Pool["query"]) => Promise<QueryResult<z.TypeOf<StateSchema>>>;

  /** A function that generates a raw query to grant the privilege. */
  grantRawQuery: (state: z.TypeOf<StateSchema>) => string;

  /** A function that generates a raw query to revoke the privilege. */
  revokeRawQuery: (state: z.TypeOf<StateSchema>) => string;
}
