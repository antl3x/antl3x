#!/usr/bin/env -S node
import 'tsx'
import {run, handle, flush} from '@oclif/core'

await run(process.argv.slice(2), import.meta.url)
  .catch(async (error) => {
    return handle(error)
  })
  .finally(async (...args) => {
    await flush()
    process.exit(0)
  })
