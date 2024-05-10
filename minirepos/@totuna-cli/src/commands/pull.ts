import * as CRDYAMLParsers from 'CRDs/@crdParsers.js'
import * as CRDs from 'CRDs/@crds.js'
import fs from 'node:fs'
import path from 'node:path'
import {BaseCommand} from './BaseCommand.js'
/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Pull the latest state from the remote database and save it to the local filesystem.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    if (!this.flags.silence) {
      this.log(`\x1b[90m❯ Pulling the latest state from the remote database...\x1b[0m`)
    }

    await this.config.runCommand('migrations:pull', ['--silence'])

    let jsonRes = []

    try {
      const CRDs = this.rootStore.userConfig.CRDs!.crds

      for (const crd of Object.values(CRDs)) {
        const parser = this.rootStore.userConfig.CRDs!.parser

        if (!parser) {
          throw new Error(`Parser not found for ${crd._kind_}`)
        }

        // Fetch the remote and local states
        const remoteStateObjects = await crd.$fetchRemoteStates()
        const localStateObjects = await parser.$fetchLocalStates(crd)

        // We filter out the state objects that are unique to the local state
        // so that we only export the state objects that are unique to the remote state
        // IMPORTANT: The orders of the state objects are important
        const diffObjects = crd.diffStateObjects(remoteStateObjects, localStateObjects)
        debugger

        for (const stateObject of diffObjects.uniqueToA) {
          const stateFile = parser.parseStateObjectToFile(stateObject)

          const filePath = parser.buildFilePath(stateObject, this.rootStore)

          jsonRes.push({filePath, stateObject})
          fs.mkdirSync(path.dirname(filePath), {recursive: true})
          fs.writeFileSync(filePath, stateFile)
          this.log(`Saved ${filePath}`)
        }

        if (!this.flags.silence && diffObjects.common.length > 0) {
          this.log(
            `\x1b[90mSkipped ${diffObjects.common.length} ${diffObjects.common[0].kind} state objects that already exist as local files.\x1b[0m`,
          )
        }
      }
      return jsonRes
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
