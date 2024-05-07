import migrations_run from './commands/migrations/run.js'
import pull from './commands/pull.js'
import preview from './commands/preview.js'
import plan from './commands/plan.js'
import apply from './commands/apply.js'

export const COMMANDS = {
  'migrations:run': migrations_run,
  pull,
  preview,
  plan,
  apply,
}
