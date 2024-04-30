import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Table                             */
/* -------------------------------------------------------------------------- */

/* --------------------- PGSQL_Privileges_On_Table_Dict --------------------- */

export const PGSQL_Privileges_On_Table_Dict = z.union([
  z.literal("SELECT"),
  z.literal("INSERT"),
  z.literal("UPDATE"),
  z.literal("DELETE"),
  z.literal("TRUNCATE"),
  z.literal("REFERENCES"),
  z.literal("TRIGGER"),
]);

export type PGSQL_Privileges_On_Table_Dict = z.TypeOf<typeof PGSQL_Privileges_On_Table_Dict>;

/* --------------------------- Privilege_On_Table --------------------------- */

export type Privilege_On_Table = z.TypeOf<typeof Privilege_On_Table>;

export const Privilege_On_Table = z.object({
  "<type>": z.literal("Privilege_On_Table").default("Privilege_On_Table"),
  table_name: z.string(),
  database: z.string(),
  table_schema: z.string(),
  grantee: z.string(),
  privilege_type: PGSQL_Privileges_On_Table_Dict,
});
