/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

export class ZodErrors extends Array<z.ZodIssue> {
  constructor(errors: z.ZodIssue[]) {
    super(...errors);
  }
}

/* -------------------------------------------------------------------------- */
/*                                    Func                                    */
/* -------------------------------------------------------------------------- */

export function func<A extends z.ZodRawShape, B>(
  args: A,
  handler: (args: z.TypeOf<z.ZodObject<A>>) => B,
): (args: z.TypeOf<z.ZodObject<A>>) => B;

export function func<A extends [z.ZodTypeAny, ...z.ZodTypeAny[]], B>(
  args: A,
  handler: (...args: z.TypeOf<z.ZodTuple<A>>) => B,
): (...args: z.TypeOf<z.ZodTuple<A>>) => B;

export function func(args: any, handler: any) {
  const schema = Array.isArray(args) ? z.tuple(args as any) : z.object(args);
  return (...inputArgs: any[]) => {
    const parsedArgs = schema.safeParse(Array.isArray(args) ? inputArgs : inputArgs[0]);
    if (!parsedArgs.success) {
      throw new ZodErrors(parsedArgs.error.errors);
    }
    return handler(...((Array.isArray(args) ? parsedArgs.data : [parsedArgs.data]) as any));
  };
}

/* -------------------------------------------------------------------------- */
/*                                   FuncDef                                  */
/* -------------------------------------------------------------------------- */

export interface FuncDef<Args, Result> {
  args: Args;
  handler: Args extends z.ZodRawShape
    ? (args: z.TypeOf<z.ZodObject<Args>>) => Result
    : Args extends [z.ZodTypeAny, ...z.ZodTypeAny[]]
      ? (...args: z.TypeOf<z.ZodTuple<Args>>) => Result
      : never;
}

export function funcDef<Args extends z.ZodRawShape, Result>(
  def: FuncDef<Args, Result>,
): (args: z.TypeOf<z.ZodObject<Args>>) => Result;

export function funcDef<Args extends [z.ZodTypeAny, ...z.ZodTypeAny[]], Result>(
  def: FuncDef<Args, Result>,
): (...args: z.TypeOf<z.ZodTuple<Args>>) => Result;

export function funcDef(def: any) {
  const schema = Array.isArray(def.args) ? z.tuple(def.args) : z.object(def.args);
  return (...inputArgs: any[]) => {
    const parsedArgs = schema.safeParse(Array.isArray(def.args) ? inputArgs : inputArgs[0]);
    if (!parsedArgs.success) {
      throw new ZodErrors(parsedArgs.error.errors);
    }
    return def.handler(...((Array.isArray(def.args) ? parsedArgs.data : [parsedArgs.data]) as any));
  };
}
