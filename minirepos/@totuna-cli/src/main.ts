import migrations_run from './migrations/commands/run.js'
import {default as exp} from './export/commands/export.js'

export const COMMANDS = {
  'migrations:run': migrations_run,
  export: exp,
}
