import { z } from "zod";

import { satisfies } from "@utils";
import { getRootStore } from "@rootStore";

import { defPrivilegeModule } from "./_impl_/defPrivilegeModule";

type module = defPrivilegeModule<typeof StateSchema>;
satisfies<module, typeof import("./@onSchema")>();

export const _metaUrl_ = import.meta.url;

/* -------------------------------------------------------------------------- */
/*                            onSchema Privilege                            */
/* -------------------------------------------------------------------------- */

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).SystemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/schemas`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).SystemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/schemas`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------- zodSchema ------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    "<type>": z.literal("Privilege_On_Schema").default("Privilege_On_Schema"),
    database: z.string(),
    schema: z.string(),
    grantee: z.string(),
    privilege: z.union([z.literal("USAGE"), z.literal("CREATE")]),
  })
  .brand("PrivilegeOnSchema");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
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
  );

/* ------------------------------ grantRawQuery ----------------------------- */

export const grantRawQuery: module["grantRawQuery"] = (state) => `GRANT ${state.privilege} ON SCHEMA ${state.schema} TO ${state.grantee};`;

/* ------------------------------ revokeRawQuery ---------------------------- */
export const revokeRawQuery: module["revokeRawQuery"] = (state) =>
  `REVOKE ${state.privilege} ON SCHEMA ${state.schema} FROM ${state.grantee};`;
