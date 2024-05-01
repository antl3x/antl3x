import { Pool, QueryResult } from "pg";
import type { z } from "zod";

export interface defPrivilegeModule<StateSchema extends z.ZodSchema>{
  _metaUrl_: string;

  INTERNAL_STATE_FOLDER_PATH: () => Promise<string>;
  INTERNAL_STATE_FILE_PATH: () => Promise<string>;
  PUBLIC_STATE_FILE_PATH: () => Promise<string>;

  /** StateSchema is a zod schema that represents the shape of the "State" object that mimics the "row" in PostgreSQL */
  StateSchema: StateSchema;
  pullQuery: (dbQuery: Pool["query"]) => Promise<QueryResult<z.TypeOf<StateSchema>>>;
  grantRawQuery: (state: z.TypeOf<StateSchema>) => string;
  revokeRawQuery: (state: z.TypeOf<StateSchema>) => string;
}
