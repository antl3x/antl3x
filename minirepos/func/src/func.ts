/* eslint-disable @typescript-eslint/no-explicit-any */

import { z, ZodObject, ZodRawShape, ZodTuple, ZodTypeAny } from 'zod';

type TypeOf<T extends ZodTypeAny> = z.infer<T>;

// Overload for object-based arguments
export function funcThrow<A extends ZodRawShape, B>(obj: {
  args: A;
  handler: (args: TypeOf<ZodObject<A>>) => B;
}): (args: TypeOf<ZodObject<A>>) => B;

// Overload for array-based arguments
export function funcThrow<A extends [ZodTypeAny, ...ZodTypeAny[]], B>(obj: {
  args: A;
  handler: (...args: TypeOf<ZodTuple<A>>) => B;
}): (...args: TypeOf<ZodTuple<A>>) => B;

// Implementation
export function funcThrow(obj: any) {
  if (Array.isArray(obj.args)) {
    const schema = z.tuple(obj.args);
    return (...args: any[]) => {
      const parsedArgs = schema.safeParse(args);
      if (!parsedArgs.success) {
        throw new Error(parsedArgs.error.errors.map((e) => e.message).join('\n'));
      }
      return obj.handler(...parsedArgs.data);
    };
  } else {
    const schema = z.object(obj.args);
    return (args: any) => {
      const parsedArgs = schema.safeParse(args);
      if (!parsedArgs.success) {
        throw new Error(parsedArgs.error.errors.map((e) => e.message).join('\n'));
      }
      return obj.handler(parsedArgs.data);
    };
  }
}

export const func = funcThrow;

export { z };
