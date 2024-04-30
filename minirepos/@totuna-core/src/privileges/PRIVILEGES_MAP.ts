import type { Schema } from "zod";
import { Privilege_On_Schema } from "./Privilege_On_Schema";
import { Pool, QueryResult } from "pg";
import { rootCtx } from "@/RootCtx";
import { Privilege_On_Table } from "./Privilege_On_Table";
import { Privilege_On_Column } from "./Privilege_On_Column";

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
    query: (dbQuery) =>
      dbQuery(
        `SELECT t.relname::text AS table_name,
        current_database() AS table_catalog,
        t.relnamespace::regnamespace::name AS table_schema,
        r.rolname AS grantee,
        p.perm AS privilege_type
 FROM pg_catalog.pg_class AS t
    CROSS JOIN pg_catalog.pg_roles AS r
    CROSS JOIN (VALUES (TEXT 'SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) AS p(perm)
 WHERE t.relnamespace::regnamespace::name <> 'information_schema'
   AND t.relnamespace::regnamespace::name NOT LIKE 'pg_%'
   AND t.relkind = 'r'
   AND r.rolname NOT LIKE 'pg_%'
   AND has_table_privilege(r.oid, t.oid, p.perm) = true;`,
      ),
  },
  Privilege_Column: {
    zodSchema: Privilege_On_Column,
    query: (dbQuery) =>
      dbQuery(
        `SELECT 
    t.relname::text AS table_name,                   
    current_database() AS table_catalog,             
    t.relnamespace::regnamespace::name AS table_schema,  
    c.attname AS column_name,                        
    r.rolname AS grantee,                            
    p.perm AS privilege_type                         
FROM pg_catalog.pg_class AS t
    JOIN pg_catalog.pg_attribute AS c ON t.oid = c.attrelid
    CROSS JOIN pg_catalog.pg_roles AS r
    CROSS JOIN (VALUES ('SELECT'), ('INSERT'), ('UPDATE'), ('REFERENCES')) AS p(perm)
WHERE t.relnamespace::regnamespace::name <> 'information_schema'
    AND t.relnamespace::regnamespace::name NOT LIKE 'pg_%'
    AND c.attnum > 0 AND NOT c.attisdropped
    AND t.relkind IN ('r', 'v')
    AND r.rolname NOT LIKE 'pg_%'
    AND has_column_privilege(r.oid, t.oid, c.attnum, p.perm) = true;
`,
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
