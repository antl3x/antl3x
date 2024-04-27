import { func, funcDef, ZodErrors, z } from '../src';

/* -------------------------------------------------------------------------- */
/*                                    func                                    */
/* -------------------------------------------------------------------------- */

describe('func', () => {
  /* ---------------------------------- Test ---------------------------------- */

  it('should validate and process named arguments', () => {
    const multiply = func({ a: z.number(), b: z.number() }, ({ a, b }) => a * b);

    expect(multiply({ a: 2, b: 3 })).toBe(6);
    expect(() => multiply({ a: '2' as never, b: 3 })).toThrow(ZodErrors);
  });

  /* ---------------------------------- Test ---------------------------------- */

  it('should validate and process positional arguments', () => {
    const subtract = func([z.number(), z.number()], (a, b) => a - b);

    expect(subtract(5, 3)).toBe(2);
    expect(() => subtract('5' as never, 3)).toThrow(ZodErrors);
  });

  /* ---------------------------------- Test ---------------------------------- */

  it('should handle optional arguments', () => {
    const greet = func(
      { name: z.string(), greeting: z.string().optional() },
      ({ name, greeting = 'Hello' }) => `${greeting}, ${name}!`,
    );

    expect(greet({ name: 'Alice' })).toBe('Hello, Alice!');
    expect(greet({ name: 'Bob', greeting: 'Hi' })).toBe('Hi, Bob!');
    expect(() => greet({ name: 123 as never })).toThrow(ZodErrors);
  });

  /* ---------------------------------- Test ---------------------------------- */

  it('should handle complex argument types', () => {
    const createUser = func(
      {
        name: z.string(),
        age: z.number().min(18),
        email: z.string().email(),
      },
      ({ name, age, email }) => ({ name, age, email }),
    );

    expect(createUser({ name: 'Alice', age: 25, email: 'alice@example.com' })).toEqual({
      name: 'Alice',
      age: 25,
      email: 'alice@example.com',
    });
    expect(() => createUser({ name: 'Bob', age: 17, email: 'bob@example.com' })).toThrow(ZodErrors);
    expect(() => createUser({ name: 'Carol', age: 30, email: 'invalid-email' })).toThrow(ZodErrors);
  });
});

/* -------------------------------------------------------------------------- */
/*                                   funcDef                                  */
/* -------------------------------------------------------------------------- */

describe('funcDef', () => {
  /* ---------------------------------- Test ---------------------------------- */

  it('should validate and process named arguments', () => {
    const multiplyDef = funcDef({
      args: { a: z.number(), b: z.number() },
      handler: ({ a, b }) => a * b,
    });

    expect(multiplyDef({ a: 2, b: 3 })).toBe(6);
    expect(() => multiplyDef({ a: '2' as never, b: 3 })).toThrow(ZodErrors);
  });

  /* ---------------------------------- Test ---------------------------------- */

  it('should validate and process positional arguments', () => {
    const subtractDef = funcDef({
      args: [z.number(), z.number()],
      handler: (a, b) => a - b,
    });

    expect(subtractDef(5, 3)).toBe(2);
    expect(() => subtractDef('5' as never, 3)).toThrow(ZodErrors);
  });

  /* ---------------------------------- Test ---------------------------------- */

  it('should handle optional arguments', () => {
    const greetDef = funcDef({
      args: { name: z.string(), greeting: z.string().optional() },
      handler: ({ name, greeting = 'Hello' }) => `${greeting}, ${name}!`,
    });

    expect(greetDef({ name: 'Alice' })).toBe('Hello, Alice!');
    expect(greetDef({ name: 'Bob', greeting: 'Hi' })).toBe('Hi, Bob!');
    expect(() => greetDef({ name: 123 as never })).toThrow(ZodErrors);
  });

  /* ---------------------------------- Test ---------------------------------- */

  it('should handle complex argument types', () => {
    const createUserDef = funcDef({
      args: {
        name: z.string(),
        age: z.number().min(18),
        email: z.string().email(),
      },
      handler: ({ name, age, email }) => ({ name, age, email }),
    });

    expect(createUserDef({ name: 'Alice', age: 25, email: 'alice@example.com' })).toEqual({
      name: 'Alice',
      age: 25,
      email: 'alice@example.com',
    });
    expect(() => createUserDef({ name: 'Bob', age: 17, email: 'bob@example.com' })).toThrow(ZodErrors);
    expect(() => createUserDef({ name: 'Carol', age: 30, email: 'invalid-email' })).toThrow(ZodErrors);
  });
});
