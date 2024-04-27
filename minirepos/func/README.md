# 🕺 `func`

<div align="center">
[![Open in Visual Studio Code](https://img.shields.io/static/v1?logo=visualstudiocode&label=&message=Open%20in%20Visual%20Studio%20Code&labelColor=2c2c32&color=007acc&logoColor=007acc)](https://open.vscode.dev/antl3x/antl3x/blob/master/minirepos/func/LICENSE)
<span> · </span>
</div>

[![MIT License](https://img.shields.io/npm/l/@antl3x/func.svg?)](https://github.com/antl3x/antl3x/blob/master/minirepos/func/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@antl3x/func.svg?style=flat)](npmjs.com/package/@antl3x/func)

## Overview 
`func` allows you to declare functions with strict type-checked arguments that are validated at runtime using `zod`.

```typescript

/* ------------------------------ Short Flavor ------------------------------ */

const add = func(
  [z.number(), z.number()],
  (a, b) => a + b
);

const fullName = func(
  { first: z.string(), last: z.string() },
  ({ first, last }) => `${first} ${last}`
);

add(4, 6); // Output: 24
add('4', 6); // Throws an error

fullName({ first: 'Mike', last: 'Lee' }) // Output: Mike Lee
fullName({ first: 'Mike' }) // Throws an error


/* ----------------------------- Verbose Flavor ----------------------------- */

const sum = funcDef({
  args: [z.number(), z.number()],
  handler: (a, b) => a + b
});

const fullName = funcDef({
  args: { first: z.string(), last: z.string() },
  handler: ({ first, last }) => `${first} ${last}`
});


sum(5, 3); // Output: 8
sum('5', 3); // Throws an error

fullName({ first: 'Mike', last: 'Lee' }) // Output: Mike Lee
fullName({ first: 'Mike' }) // Throws an error



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

### 1. Func

### 1.1 Description

`func` is the less verbose flavor used to define your type-checked function.

```typescript

func(args, handler): (...args: T[]) => T

```

### 1.2 Parameters

> - **args**
>     - A `ZodSchema` object or array that defines the argument schema for the function.
>     - If an object is provided, the function expects named arguments matching the schema.
>     - If an array is provided, the function expects positional arguments matching the schema.

> - **handler**
>     - The function that will be executed with the parsed and validated arguments.
>     - The handler function should accept the arguments based on the defined schema.
>     - If an object schema is used, the handler should expect an object with the corresponding properties.
>     - If an array schema is used, the handler should expect individual arguments in the same order as the schema.


### 1.3 Examples 

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

### 2. FuncDef

### 2.1 Description

`funcDef` is the more verbose flavor used to define your type-checked function. It allows you to separate the argument schema and handler in a more explicit way.

```typescript
funcDef({ args, handler }): (...args: T[]) => T
```

### 2.2 Parameters

> - **args**
>     - A `ZodSchema` object or array that defines the argument schema for the function.
>     - If an object is provided, the function expects named arguments matching the schema.
>     - If an array is provided, the function expects positional arguments matching the schema.

> - **handler**
>     - The function that will be executed with the parsed and validated arguments.
>     - The handler function should accept the arguments based on the defined schema.
>     - If an object schema is used, the handler should expect an object with the corresponding properties.
>     - If an array schema is used, the handler should expect individual arguments in the same order as the schema.

### 2.3 Examples

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
