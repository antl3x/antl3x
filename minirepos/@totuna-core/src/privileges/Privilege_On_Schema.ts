import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Schema                             */
/* -------------------------------------------------------------------------- */

/* --------------------- PGSQL_Privileges_On_Schema_Dict -------------------- */

export const PGSQL_Privileges_On_Schema_Dict = z.union([z.literal("USAGE"), z.literal("CREATE")]);

/* --------------------------- Privilege_On_Schema -------------------------- */

export type Privilege_On_Schema = z.TypeOf<typeof Privilege_On_Schema>;

export const Privilege_On_Schema = z.object({
  "<type>": z.literal("Privilege_On_Schema").default("Privilege_On_Schema"),
  database: z.string(),
  schema: z.string(),
  grantee: z.string(),
  privilege: PGSQL_Privileges_On_Schema_Dict,
});
