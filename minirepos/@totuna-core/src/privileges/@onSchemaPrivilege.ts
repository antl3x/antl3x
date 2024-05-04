import { z } from "zod";

import { satisfies } from "_utils_/_@utils_.js";
import { getRootStore } from "@rootStore.js";
import type { module as atPrivilege } from "./@privilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module, typeof import("./@onSchemaPrivilege.js")>;

export interface module extends atPrivilege<typeof StateSchema, "onSchema"> {}

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onSchema";

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).systemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/schemas`;

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

export const grantRawQuery: module["grantRawQuery"] = (state) =>
  `GRANT ${state.privilege} ON SCHEMA ${state.schema} TO "${state.grantee}";`;

/* ------------------------------ revokeRawQuery ---------------------------- */
export const revokeRawQuery: module["revokeRawQuery"] = (state) =>
  `REVOKE ${state.privilege} ON SCHEMA ${state.schema} FROM "${state.grantee}";`;
