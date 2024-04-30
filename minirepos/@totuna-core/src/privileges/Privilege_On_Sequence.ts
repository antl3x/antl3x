import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                          Privilege_On_Sequence                             */
/* -------------------------------------------------------------------------- */

/* --------------------- PGSQL_Privileges_On_Sequence_Dict --------------------- */

export const PGSQL_Privileges_On_Sequence_Dict = z.union([z.literal("SELECT"), z.literal("USAGE"), z.literal("UPDATE")]);

export type PGSQL_Privileges_On_Sequence_Dict = z.TypeOf<typeof PGSQL_Privileges_On_Sequence_Dict>;

/* --------------------------- Privilege_On_Sequence --------------------------- */

export type Privilege_On_Sequence = z.TypeOf<typeof Privilege_On_Sequence>;

export const Privilege_On_Sequence = z.object({
  "<type>": z.literal("Privilege_On_Sequence").default("Privilege_On_Sequence"),
  database: z.string(),
  grantee: z.string(),
  schema: z.string(),
  sequence: z.string(),
  privilege: PGSQL_Privileges_On_Sequence_Dict,
});
