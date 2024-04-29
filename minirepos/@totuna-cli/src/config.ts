import {Command} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'

export class Config extends Command {
  async run() {
    const userConfig = fs.readFileSync(path.join(this.config.configDir, 'config.json'))

    this.log('User config:')
    console.dir(userConfig)
  }
}
