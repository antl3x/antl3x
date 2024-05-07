import {BaseCommand} from './BaseCommand.js'
import * as CRDs from 'CRD/@crds.js'
import * as CRDYAMLParsers from 'CRD/@crdParsers.js'
import fs from 'node:fs'
import path from 'node:path'
/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Exports current database state to CRD files.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    this.log(`\x1b[90m❯ Pulling the latest state from the remote database..\x1b[0m`)
    let jsonRes = []
    try {
      for (const crd of Object.values(CRDs)) {
        const stateObjects = await crd.$fetchRemoteStates()

        for (const stateObject of stateObjects) {
          const parser = CRDYAMLParsers[`CRDParser_${stateObject.kind}_YAML`]

          if (!parser) {
            throw new Error(`Parser not found for ${stateObject.kind}`)
          }

          const stateFile = parser.parseStateObjectToFile(stateObject)

          const filePath = parser.buildFilePath(stateObject, this.rootStore)

          // If file already exists, skip
          if (fs.existsSync(filePath)) {
            if (!this.flags.silence) this.log(`\x1b[90mFile already exists. Skipping ${filePath}\x1b[0m`)
            continue
          }

          jsonRes.push({filePath, stateObject})
          fs.mkdirSync(path.dirname(filePath), {recursive: true})
          fs.writeFileSync(filePath, stateFile)
        }

        return jsonRes
      }
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
