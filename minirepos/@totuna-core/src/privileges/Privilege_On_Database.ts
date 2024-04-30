import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Database                          */
/* -------------------------------------------------------------------------- */

/* --------------------- PGSQL_Privileges_On_Schema_Dict -------------------- */

export const PGSQL_Privileges_On_Schema_Dict = z.union([z.literal("CREATE"), z.literal("CONNECT"), z.literal("TEMPORARY")]);

/* -------------------------- Privilege_On_Database ------------------------- */

export type Privilege_On_Database = z.TypeOf<typeof Privilege_On_Database>;

export const Privilege_On_Database = z.object({
  "<type>": z.literal("Privilege_On_Database").default("Privilege_On_Database"),
  database: z.string(),
  grantee: z.string(),
  privilege_type: z.string(),
});
