# 🕺 `func`

`func` allows you to declare functions with strict type-checked arguments that are validated at runtime using `zod`.

```typescript
const sum = func(
  { a: z.number(), b: z.number() },
  ({ a, b }) => a + b
);

const mul = func(
  [z.number(), z.number()],
  (a, b) => a * b
);

// Success
sum({ a: 5, b: 3 }); // Output: 8
mul(4, 6); // Output: 24

// Fail
sum({ a: '5', b: 3 }); // Throws an error: "Expected number, received string"
```

Created by [@antl3x](https://antl3x.co)

## Features

- Supports both object-based and array-based argument definitions
- Seamless integration with `zod` for argument validation and parsing
- Automatic error handling and throwing of validation errors
- TypeScript support for enhanced type safety and autocompletion

## Installation

```bash
pnpm install @antl3x/func
```

## Usage

### Using `func`

Define functions using the `func` helper to specify the function argument schema and handler:

```typescript
import { func, z } from '@antl3x/func';

/** - - - - - Example 1 - - - - - */

const greet = func(
  { name: z.string(), age: z.number().optional() },
  ({ name, age }) => {
    const ageStr = age ? ` You are ${age} years old.` : '';
    return `Hello, ${name}!${ageStr}`;
});

greet({ name: 'Alice', age: 25 }); // Output: "Hello, Alice! You are 25 years old."
greet({ name: 'Bob' }); // Output: "Hello, Bob!"

/** - - - - - Example 2 - - - - - */

const calculateArea = func(
  [z.number(), z.number()],
  (width, height) => width * height
);

calculateArea(5, 7); // Output: 35
```

### Using `funcDef`

Define functions using the `funcDef` helper to separate the argument schema and handler in a more explicit/verbose way:

```typescript
import { funcDef, z } from '@antl3x/func';

/** - - - - - Example 1 - - - - - */

const greetDef = funcDef({
  args: { name: z.string(), age: z.number().optional() },
  handler: ({ name, age }) => {
    const ageStr = age ? ` You are ${age} years old.` : '';
    return `Hello, ${name}!${ageStr}`;
  },
});

greetDef({ name: 'Alice', age: 25 }); // Output: "Hello, Alice! You are 25 years old."
greetDef({ name: 'Bob' }); // Output: "Hello, Bob!"

/** - - - - - Example 2 - - - - - */

const calculateAreaDef = funcDef({
  args: [z.number(), z.number()],
  handler: (width, height) => width * height,
});

calculateAreaDef(5, 7); // Output: 35
```

The `args` property can be either an object or an array, allowing you to define named or positional arguments respectively.

The argument types are defined using the `zod` schema validation library.

The `handler` function receives the parsed and validated arguments based on the defined schema.

If the arguments fail validation, an error is automatically thrown with a detailed error message.

## License

This project is licensed under the MIT License.

---
