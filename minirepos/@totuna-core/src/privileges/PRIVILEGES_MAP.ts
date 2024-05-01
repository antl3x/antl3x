import type { Schema } from "zod";
import { Privilege_On_Schema } from "./Privilege_On_Schema";
import { Pool, QueryResult } from "pg";
import { rootCtx } from "@/RootCtx";
import { Privilege_On_Table } from "./Privilege_On_Table";
import { Privilege_On_Database } from "./Privilege_On_Database";
import { Privilege_On_View } from "./Privilege_On_View";
import { Privilege_On_Function } from "./Privilege_On_Function";
import { Privilege_On_Sequence } from "./Privilege_On_Sequence";

/* -------------------------------------------------------------------------- */
/*                                PRIVILEGES_MAP                              */
/* -------------------------------------------------------------------------- */

export type PRIVILEGE = {
  zodSchema: Schema;
  query: (dbQuery: Pool["query"], ctx: ReturnType<typeof rootCtx.get>) => Promise<QueryResult<any>>;
};

export type PRIVILEGES_MAP = Record<string, PRIVILEGE>;

export const PRIVILEGES_MAP: PRIVILEGES_MAP = {
  Privilege_On_Sequence: {
    zodSchema: Privilege_On_Sequence,
    query: (dbQuery) =>
      dbQuery(
        `SELECT 
        current_database() AS database,
        r.rolname AS grantee,
        t.relnamespace::regnamespace::name AS schema,
        t.relname::text AS sequence,
        p.perm AS privilege
 FROM pg_catalog.pg_class AS t
    CROSS JOIN pg_catalog.pg_roles AS r
    CROSS JOIN (VALUES ('SELECT'), ('USAGE'), ('UPDATE')) AS p(perm)
 WHERE t.relnamespace::regnamespace::name <> 'information_schema'
   AND t.relnamespace::regnamespace::name NOT LIKE 'pg_%'
   AND t.relkind = 'S'
   and r.rolname not like 'pg_%'
   and has_sequence_privilege(r.oid, t.oid, p.perm) = true;`,
      ),
  },
  Privilege_On_Function: {
    zodSchema: Privilege_On_Function,
    query: (dbQuery) =>
      dbQuery(
        `SELECT 
        r.rolname AS grantee,
        current_database() AS database,
        f.pronamespace::regnamespace::name AS schema,
        regexp_replace(f.oid::regprocedure::text, '^((("[^"]*")|([^"][^.]*))\\.)?', '') AS function,
        'EXECUTE' AS privilege,
        has_function_privilege(r.oid, f.oid, 'EXECUTE') AS granted
 FROM pg_catalog.pg_proc f
    CROSS JOIN pg_catalog.pg_roles AS r
 WHERE f.pronamespace::regnamespace::name <> 'information_schema'
   AND f.pronamespace::regnamespace::name NOT LIKE 'pg_%'
    AND r.rolname NOT LIKE 'pg_%'
    and has_function_privilege(r.oid, f.oid, 'EXECUTE') = true;`,
      ),
  },
  Privilege_Table: {
    zodSchema: Privilege_On_Table,
    query: (dbQuery) =>
      dbQuery(
        `SELECT t.relname::text AS table_name,
        current_database() AS database,
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
  Privilege_On_View: {
    zodSchema: Privilege_On_View,
    query: (dbQuery) =>
      dbQuery(
        `SELECT t.relname::text AS view,
        current_database() AS database,
        t.relnamespace::regnamespace::name AS schema,
        r.rolname AS grantee,
        p.perm AS privilege
 FROM pg_catalog.pg_class AS t
    CROSS JOIN pg_catalog.pg_roles AS r
    CROSS JOIN (VALUES (TEXT 'SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) AS p(perm)
 WHERE t.relnamespace::regnamespace::name <> 'information_schema'
   AND t.relnamespace::regnamespace::name NOT LIKE 'pg_%'
   AND t.relkind = 'v'
   AND r.rolname NOT LIKE 'pg_%'
   AND has_table_privilege(r.oid, t.oid, p.perm) = true;`,
      ),
  },
  Privilege_On_Schema: {
    zodSchema: Privilege_On_Schema,
    query: (dbQuery) =>
      dbQuery(
        `SELECT current_database() AS database, r.rolname AS grantee,
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
      ),
  },
  Privilege_On_Database: {
    zodSchema: Privilege_On_Database,
    query: (dbQuery) =>
      dbQuery(
        `select
        current_database() as database,
        r.rolname AS grantee,
        p.perm AS privilege_type,
        has_database_privilege(r.oid, d.oid, p.perm) AS granted
    FROM pg_catalog.pg_database AS d
       CROSS JOIN pg_catalog.pg_roles AS r
       CROSS JOIN (VALUES ('CREATE'), ('CONNECT'), ('TEMPORARY')) AS p(perm)
    WHERE d.datname = current_database()
      AND has_database_privilege(r.oid, d.oid, p.perm) = true;`,
      ),
  },
} as const;
