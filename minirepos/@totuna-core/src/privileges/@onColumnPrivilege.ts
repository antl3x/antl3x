import { z } from "zod";

import { satisfies } from "_utils_/@utils.js";
import { getRootStore } from "@rootStore.js";
import type { module as atPrivilege } from "./@privilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module extends atPrivilege<typeof StateSchema, "onColumn"> {}

satisfies<module>()(import("./@onColumnPrivilege.js"));

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onColumn";

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).systemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/columns`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).systemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/columns`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------- zodSchema ------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    table_name: z.string(),
    database: z.string(),
    table_schema: z.string(),
    column_name: z.string(),
    grantee: z.string(),
    privilege_type: z.string(),
  })
  .brand("PrivilegeOnColumn");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
  dbQuery(
    `SELECT 
t.relname::text AS table_name,                   
current_database() AS database,             
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
  );

export const grantRawQuery: module["grantRawQuery"] = (state) => {
  return `GRANT ${state.privilege_type} (${state.column_name}) ON ${state.table_schema}.${state.table_name} TO ${state.grantee};`;
};

export const revokeRawQuery: module["revokeRawQuery"] = (state) => {
  return `REVOKE ${state.privilege_type} (${state.column_name}) ON ${state.table_schema}.${state.table_name} FROM ${state.grantee};`;
};
