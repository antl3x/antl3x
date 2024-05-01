import { satisfies } from "@utils";
import { getRootStore } from "@rootStore";

import { z } from "zod";
import { defPrivilegeModule } from "./_impl_/types";

type module = defPrivilegeModule<typeof StateSchema>;
satisfies<module, typeof import("./@onTable")>();

export const _metaUrl_ = import.meta.url;

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Table                             */
/* -------------------------------------------------------------------------- */

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).SystemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/tables`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).SystemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/tables`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------- zodSchema ------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    "<type>": z.literal("Privilege_On_Table").default("Privilege_On_Table"),
    table_name: z.string(),
    database: z.string(),
    table_schema: z.string(),
    grantee: z.string(),
    privilege_type: z.union([
      z.literal("SELECT"),
      z.literal("INSERT"),
      z.literal("UPDATE"),
      z.literal("DELETE"),
      z.literal("TRUNCATE"),
      z.literal("REFERENCES"),
      z.literal("TRIGGER"),
    ]),
  })
  .brand("PrivilegeOnTable");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
  dbQuery(
    `SELECT 
t.relname AS table_name,
current_database() AS database,
n.nspname AS table_schema,
r.rolname AS grantee,
p.privilege_type
FROM pg_tables t
JOIN pg_namespace n ON t.schemaname = n.nspname
JOIN pg_roles r ON r.rolname NOT LIKE 'pg_%'
CROSS JOIN unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER']) AS privilege_type(p)
WHERE n.nspname <> 'pg_catalog' AND n.nspname <> 'information_schema'
AND has_table_privilege(r.oid, concat(t.schemaname, '.', t.tablename), p.privilege_type) = true;
`,
  );

export const grantRawQuery: module["grantRawQuery"] = (state) => {
  return `GRANT ${state.privilege_type} ON ${state.table_schema}.${state.table_name} TO ${state.grantee};`;
};

export const revokeRawQuery: module["revokeRawQuery"] = (state) => {
  return `REVOKE ${state.privilege_type} ON ${state.table_schema}.${state.table_name} FROM ${state.grantee};`;
};
