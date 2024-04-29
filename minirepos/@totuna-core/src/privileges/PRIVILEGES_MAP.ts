import { Privilege_On_Column, Privilege_On_Table } from "@/@types";
import type { Schema } from "zod";
import { Privilege_On_Schema } from "./Privilege_On_Schema";
import { Pool, QueryResult } from "pg";
import { rootCtx } from "@/RootCtx";

/* -------------------------------------------------------------------------- */
/*                                PRIVILEGES_MAP                              */
/* -------------------------------------------------------------------------- */

export type PRIVILEGE = {
  zodSchema: Schema;
  query: (dbQuery: Pool["query"], ctx: ReturnType<typeof rootCtx.get>) => Promise<QueryResult<any>>;
};

export type PRIVILEGES_MAP = Record<string, PRIVILEGE>;

export const PRIVILEGES_MAP: PRIVILEGES_MAP = {
  Privilege_Table: {
    zodSchema: Privilege_On_Table,
    query: (dbQuery, ctx) =>
      dbQuery(
        `SELECT 
                table_name,
                table_catalog,
                table_schema,
                grantee,
                privilege_type
              FROM 
                information_schema.table_privileges
              WHERE table_schema = $1;`,
        [ctx!.config.schemaName],
      ),
  },
  Privilege_Column: {
    zodSchema: Privilege_On_Column,
    query: (dbQuery, ctx) =>
      dbQuery(
        `SELECT 
                table_name,
                table_catalog,
                table_schema,
                column_name,
                grantee,
                privilege_type
              FROM 
                information_schema.column_privileges
              WHERE table_schema = $1;`,
        [ctx!.config.schemaName],
      ),
  },
  Privilege_On_Schema: {
    zodSchema: Privilege_On_Schema,
    query: (dbQuery, ctx) =>
      dbQuery(
        `SELECT $1 AS database, r.rolname AS grantee,
    n.nspname AS schema,
    p.perm AS privilege
FROM pg_catalog.pg_namespace AS n
 CROSS JOIN pg_catalog.pg_roles AS r
 CROSS JOIN (VALUES ('USAGE'), ('CREATE')) AS p(perm)
WHERE has_schema_privilege(r.oid, n.oid, p.perm)
   AND n.nspname <> 'information_schema'
   AND n.nspname !~~ 'pg\\_%'
   AND r.rolname !~~ 'pg\\_%'
--      AND NOT r.rolsuper`,
        [ctx!.config.pgConfig.database],
      ),
  },
} as const;
