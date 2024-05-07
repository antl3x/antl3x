import migrations_run from './commands/migrations/run.js'
import migrations_pull from './commands/migrations/pull.js'
import pull from './commands/pull.js'
import preview from './commands/preview.js'
import plan from './commands/plan.js'
import apply from './commands/apply.js'

export const COMMANDS = {
  'migrations:run': migrations_run,
  'migrations:pull': migrations_pull,
  pull,
  preview,
  plan,
  apply,
}
