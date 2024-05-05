/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

import { z } from "zod";

export interface module {}

export type PolicyState = z.TypeOf<typeof PolicyState>;

export const PolicyState = z.object({
  name: z.string(),
  for: z.enum(["SELECT", "INSERT", "UPDATE", "DELETE", "ALL"]),
  to: z.array(z.string()),
  as: z.enum(["PERMISSIVE", "RESTRICTIVE"]),
  exprUsing: z.nullable(z.string()),
  exprWithCheck: z.nullable(z.string()),
  schema: z.string(),
  table: z.string(),
});

export type TableState = z.TypeOf<typeof TableState>;

export const TableState = z.object({
  rlsEnabled: z.boolean(),
  schema: z.string(),
  table: z.string(),
});

export type TableFile = z.TypeOf<typeof TableFile>;

export const TableFile = z.object({
  rlsEnabled: z.boolean(),

  policies: z.array(
    z.object({
      name: PolicyState.shape.name,
      for: PolicyState.shape.for,
      to: PolicyState.shape.to,
      as: PolicyState.shape.as,
      exprUsing: PolicyState.shape.exprUsing,
      exprWithCheck: PolicyState.shape.exprWithCheck,
    }),
  ),

  _meta_: z.object({
    schema: z.string(),
    table: z.string(),
  }),
});
