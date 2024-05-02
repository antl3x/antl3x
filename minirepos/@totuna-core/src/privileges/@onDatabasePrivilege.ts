import { z } from "zod";

import { satisfies } from "_utils_/@utils.js";
import { getRootStore } from "@rootStore.js";
import type { module as atPrivilege } from "./@privilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module extends atPrivilege<typeof StateSchema, "onDatabase"> {}

satisfies<module>()(import("./@onDatabasePrivilege.js"));

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onDatabase";

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).systemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/database`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).systemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/database`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------- zodSchema ------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    database: z.string(),
    grantee: z.string(),
    privilege_type: z.union([z.literal("CREATE"), z.literal("CONNECT"), z.literal("TEMPORARY")]),
  })
  .brand("PrivilegeOnDatabase");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
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
  );

/* ------------------------------ grantRawQuery ----------------------------- */

export const grantRawQuery: module["grantRawQuery"] = (state) => {
  return `GRANT ${state.privilege_type} ON DATABASE ${state.database} TO ${state.grantee};`;
};

/* ----------------------------- revokeRawQuery ----------------------------- */

export const revokeRawQuery: module["revokeRawQuery"] = (state) => {
  return `REVOKE ${state.privilege_type} ON DATABASE ${state.database} FROM ${state.grantee};`;
};
