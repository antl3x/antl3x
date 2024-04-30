import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Function                          */
/* -------------------------------------------------------------------------- */

/* --------------------- PGSQL_Privileges_On_Schema_Dict -------------------- */

export const PGSQL_Privileges_On_Schema_Dict = z.literal("EXECUTE");

/* -------------------------- Privilege_On_Function ------------------------- */

export type Privilege_On_Function = z.TypeOf<typeof Privilege_On_Function>;

export const Privilege_On_Function = z.object({
  "<type>": z.literal("Privilege_On_Function").default("Privilege_On_Function"),
  function: z.string(),
  schema: z.string(),
  grantee: z.string(),
  database: z.string(),
  privilege: z.string(),
});
