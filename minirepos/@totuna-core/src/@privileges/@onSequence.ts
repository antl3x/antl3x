import { z } from "zod";

import { satisfies } from "@utils";
import { getRootStore } from "@rootStore";

import { defPrivilegeModule } from "./_impl_/defPrivilegeModule";

type module = defPrivilegeModule<typeof StateSchema>;
satisfies<module, typeof import("./@onSequence")>();

export const _metaUrl_ = import.meta.url;

/* -------------------------------------------------------------------------- */
/*                            onSequence Privilege                            */
/* -------------------------------------------------------------------------- */

export const PUBLIC_STATE_FILE_PATH = async () => `${(await getRootStore()).SystemVariables.PUBLIC_STATE_PRIVILEGES_PATH}/sequences`;
export const INTERNAL_STATE_FOLDER_PATH = async () => `${(await getRootStore()).SystemVariables.INTERNAL_STATE_PRIVILEGES_PATH}/sequences`;
export const INTERNAL_STATE_FILE_PATH = async () => `${await INTERNAL_STATE_FOLDER_PATH()}/state.json`;

/* -------------------------------- zodSchema ------------------------------- */

export type StateSchema = z.TypeOf<typeof StateSchema>;

export const StateSchema = z
  .object({
    database: z.string(),
    grantee: z.string(),
    schema: z.string(),
    sequence: z.string(),
    privilege: z.union([z.literal("SELECT"), z.literal("USAGE"), z.literal("UPDATE")]),
  })

  .brand("PrivilegeOnSequence");

/* -------------------------------- pullQuery ------------------------------- */

export const pullQuery: module["pullQuery"] = (dbQuery) =>
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
  );

/* ------------------------------ grantRawQuery ----------------------------- */

export const grantRawQuery: module["grantRawQuery"] = (state) =>
  `GRANT ${state.privilege} ON SEQUENCE ${state.schema}.${state.sequence} TO ${state.grantee};`;

/* ------------------------------ revokeRawQuery ----------------------------- */

export const revokeRawQuery: module["revokeRawQuery"] = (state) =>
  `REVOKE ${state.privilege} ON SEQUENCE ${state.schema}.${state.sequence} FROM ${state.grantee};`;
