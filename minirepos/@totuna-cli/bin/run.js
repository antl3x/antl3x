#!/usr/bin/env node_modules/@totuna/cli/node_modules/tsx/dist/cli.mjs

import {execute} from '@oclif/core'

await execute({dir: import.meta.url})
