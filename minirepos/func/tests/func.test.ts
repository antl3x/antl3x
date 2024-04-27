import { func, z } from '../src/index';

describe('func', () => {
  /* ------------------------------------ ! ----------------------------------- */

  it('should validate and parse object-based arguments correctly', () => {
    const add = func({
      args: { a: z.number(), b: z.number() },
      handler: ({ a, b }) => a + b,
    });

    expect(add({ a: 2, b: 3 })).toBe(5);
    expect(() => add({ a: '2' as never, b: 3 })).toThrow('Expected number, received string');
  });

  /* ------------------------------------ ! ----------------------------------- */

  it('should validate and parse array-based arguments correctly', () => {
    const multiply = func({
      args: [z.number(), z.number()],
      handler: (a, b) => a * b,
    });

    expect(multiply(2, 3)).toBe(6);
    expect(() => multiply('2' as never, 3)).toThrow('Expected number, received string');
  });
});
