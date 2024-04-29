import { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                             Privilege_On_Column                            */
/* -------------------------------------------------------------------------- */
export type Privilege_On_Column = z.TypeOf<typeof Privilege_On_Column>;

export const Privilege_On_Column = z.object({
  "<type>": z.literal("Privilege_On_Column").default("Privilege_On_Column"),
  table_name: z.string(),
  table_catalog: z.string(),
  table_schema: z.string(),
  column_name: z.string(),
  grantee: z.string(),
  privilege_type: z.string(),
});
