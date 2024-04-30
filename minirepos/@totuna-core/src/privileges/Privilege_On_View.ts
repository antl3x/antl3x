import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_View                              */
/* -------------------------------------------------------------------------- */

/* --------------------- PGSQL_Privileges_On_View_Dict -------------------- */

export const PGSQL_Privileges_On_View_Dict = z.union([
  z.literal("SELECT"),
  z.literal("INSERT"),
  z.literal("UPDATE"),
  z.literal("DELETE"),
  z.literal("TRUNCATE"),
  z.literal("REFERENCES"),
  z.literal("TRIGGER"),
]);

/* --------------------------- Privilege_On_View -------------------------- */

export type Privilege_On_View = z.TypeOf<typeof Privilege_On_View>;

export const Privilege_On_View = z.object({
  "<type>": z.literal("Privilege_On_View").default("Privilege_On_View"),
  database: z.string(),
  schema: z.string(),
  grantee: z.string(),
  privilege: PGSQL_Privileges_On_View_Dict,
});
