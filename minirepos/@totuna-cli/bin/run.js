#!/usr/bin/env node_modules/@totuna/cli/node_modules/tsx/dist/cli.mjs --no-warnings=ExperimentalWarning

import {run, handle, flush} from '@oclif/core'

await run(process.argv.slice(2), import.meta.url)
  .catch(async (error) => {
    return handle(error)
  })
  .finally(async () => flush())
