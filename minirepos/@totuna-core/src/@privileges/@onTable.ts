import { satisfies } from "@utils/index.js";
import { getRootStore } from "@rootStore/index.js";

import { z } from "zod";
import { defPrivilegeModule } from "./_impl_/defPrivilegeModule.js";

type module = defPrivilegeModule<typeof StateSchema>;
satisfies<module, typeof import("./@onTable.js")>();

export const _metaId_ = "onTable";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Table                             */
/* -------------------------------------------------------------------------- */

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).systemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/tables`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).systemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/tables`;
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
  );

export const grantRawQuery: module["grantRawQuery"] = (state) => {
  return `GRANT ${state.privilege_type} ON ${state.table_schema}.${state.table_name} TO ${state.grantee};`;
};

export const revokeRawQuery: module["revokeRawQuery"] = (state) => {
  return `REVOKE ${state.privilege_type} ON ${state.table_schema}.${state.table_name} FROM ${state.grantee};`;
};
