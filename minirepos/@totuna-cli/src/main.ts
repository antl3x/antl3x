import migrations_run from './commands/migrations/run.js'
import pull from './commands/pull.js'
import compare from './commands/compare.js'

export const COMMANDS = {
  'migrations:run': migrations_run,
  pull,
  compare,
}
