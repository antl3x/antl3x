#!/usr/bin/env -S node
import 'tsx'
import {run, handle, flush} from '@oclif/core'
process.env.NODE_ENV = 'development'

await run(process.argv.slice(2), import.meta.url)
  .catch(async (error) => {
    error.message = '\x1b[31m✖\x1b[0m ' + error.message
    return handle(error)
  })
  .finally(async (...args) => {
    await flush()
    process.exit(0)
  })
