import { z } from "zod";

export const getZodTypeIdentifier = (zschema: z.ZodSchema<any>) => {
  return (zschema as any)?._def?.shape()["<type>"]._def.defaultValue();
};
