import { z } from "zod";

import { satisfies } from "_utils_/@utils.js";
import { getRootStore } from "@rootStore.js";

import type { module as atPrivilege } from "./@privilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module extends atPrivilege<typeof StateSchema, "onView"> {}

satisfies<module>()(import("./@onViewPrivilege.js"));

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onView" as const;

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).systemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/views`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).systemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/views`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------- zodSchema ------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    database: z.string(),
    schema: z.string(),
    view: z.string(),
    grantee: z.string(),
    privilege: z.union([
      z.literal("SELECT"),
      z.literal("INSERT"),
      z.literal("UPDATE"),
      z.literal("DELETE"),
      z.literal("TRUNCATE"),
      z.literal("REFERENCES"),
      z.literal("TRIGGER"),
    ]),
  })
  .brand("onView");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
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
  );

/* ------------------------------ grantRawQuery ----------------------------- */

export const grantRawQuery: module["grantRawQuery"] = (state) => {
  return `GRANT ${state.privilege} ON ${state.schema}.${state.view} TO ${state.grantee};`;
};

/* ----------------------------- revokeRawQuery ----------------------------- */

export const revokeRawQuery: module["revokeRawQuery"] = (state) => {
  return `REVOKE ${state.privilege} ON ${state.schema}.${state.view} FROM ${state.grantee};`;
};
