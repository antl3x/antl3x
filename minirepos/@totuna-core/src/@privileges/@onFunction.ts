import { z } from "zod";
import { satisfies } from "@utils/index.js";

import { defPrivilegeModule } from "./_impl_/defPrivilegeModule.js";
import { getRootStore } from "@rootStore/index.js";

type module = defPrivilegeModule<typeof StateSchema>;
satisfies<module, typeof import("./@onFunction.js")>();

export const _metaId_ = "onFunction";

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).systemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/functions`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).systemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/functions`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------------------------------------------------- */
/*                             StateSchema                          */
/* -------------------------------------------------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    function: z.string(),
    schema: z.string(),
    grantee: z.string(),
    database: z.string(),
    privilege: z.literal("EXECUTE"),
  })
  .brand("PrivilegeOnFunction");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
  dbQuery(
    `SELECT 
    r.rolname AS grantee,
    current_database() AS database,
    f.pronamespace::regnamespace::name AS schema,
    regexp_replace(f.oid::regprocedure::text, '^((("[^"]*")|([^"][^.]*))\\.)?', '') AS function,
    'EXECUTE' AS privilege,
    has_function_privilege(r.oid, f.oid, 'EXECUTE') = true
    FROM pg_catalog.pg_proc f
    CROSS JOIN pg_catalog.pg_roles AS r
    WHERE f.pronamespace::regnamespace::name <> 'information_schema'
    AND f.pronamespace::regnamespace::name NOT LIKE 'pg_%'
    AND r.rolname NOT LIKE 'pg_%'
    and has_function_privilege(r.oid, f.oid, 'EXECUTE') = true;`,
  );

export const grantRawQuery: module["grantRawQuery"] = (state) => {
  return `GRANT EXECUTE ON FUNCTION ${state.schema}.${state.function} TO ${state.grantee};`;
};

export const revokeRawQuery: module["revokeRawQuery"] = (state) => {
  return `REVOKE EXECUTE ON FUNCTION ${state.schema}.${state.function} FROM ${state.grantee};`;
};
