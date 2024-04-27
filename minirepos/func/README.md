# 🕺 `func`

`func` let you declare functions with stricted type checking arguments that are validated in run-time using `zod`.

```typescript
const sum = func({
  args: { a: z.number(), b: z.number() },
  handler: ({ a, b }) => a + b,
});

const mul = func({
  args: [z.number(), z.number()],
  handler: (a, b) => a * b,
});

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

Import the `func` and `z` from the `@antl3x/func` package:

```typescript
import { func, z } from '@antl3x/func';
```

Define functions using the `func` function and specify the argument schema and handler:



The `args` property can be either an object or an array, allowing you to define named or positional arguments respectively. The argument types are defined using the `zod` schema validation library.

The `handler` function receives the parsed and validated arguments based on the defined schema. If the arguments fail validation, an error is automatically thrown with a detailed error message.

Invoke the defined functions with the appropriate arguments:

## Examples

Here are a few more examples showcasing the flexibility of `func`:

```typescript
const greet = func({
  args: { name: z.string(), age: z.number().optional() },
  handler: ({ name, age }) => {
    const ageStr = age ? ` You are ${age} years old.` : '';
    return `Hello, ${name}!${ageStr}`;
  },
});

console.log(greet({ name: 'Alice', age: 25 })); // Output: "Hello, Alice! You are 25 years old."
console.log(greet({ name: 'Bob' })); // Output: "Hello, Bob!"
```

```typescript
const calculateArea = func({
  args: { width: z.number(), height: z.number() },
  handler: ({ width, height }) => width * height,
});

console.log(calculateArea({ width: 5, height: 7 })); // Output: 35
```

## License

This project is licensed under the MIT License.

---
