#!/usr/bin/env -S node_modules/.bin/tsx --no-warnings=ExperimentalWarning

import {execute} from '@oclif/core'

await execute({development: true, dir: import.meta.url})
