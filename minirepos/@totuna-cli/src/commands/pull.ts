import type {TypeOf} from 'zod'
import fs from 'node:fs'
import path from 'node:path'
import {BaseCommand} from './BaseCommand.js'
import {diffStateObjects} from 'CRDs/@utils.js'
import {Flags} from '@oclif/core'
import {IRCDParser} from 'CRDs/ICRDParser.js'
import {ICRD} from 'CRDs/ICRD.js'
import {RootStore__Ready} from '@RootStore.js'
/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Pull the latest state from the remote database and save it to the local filesystem.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static flags = {
    // can pass either --force or -f
    force: Flags.boolean({char: 'f'}),
  }

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    const isSilence = this.flags.silence || this.flags.json
    if (!isSilence) {
      this.log(`\x1b[90m❯ Pulling the latest state from the remote database...\x1b[0m`)
    }

    await this.config.runCommand('migrations:pull', ['--silence'])

    let jsonRes = []

    try {
      const parser = this.rootStore.userConfig.tsOptions.parser
      const CRDs = this.rootStore.userConfig.tsOptions.crds

      for (const crd of Object.values(CRDs)) {
        if (!parser) {
          throw new Error(`Parser not found for ${crd._kind_}`)
        }

        // Fetch the remote and local states
        const remoteStateObjects = await crd.$fetchRemoteStates()
        const localState = await parser.$fetchLocalStates(crd)
        const localStateObjects = localState.map((i) => i.object)

        // We filter out the state objects that are unique to the local state
        // so that we only export the state objects that are unique to the remote state
        // IMPORTANT: The orders of the state objects are important
        const diffObjects = diffStateObjects(remoteStateObjects, localStateObjects, crd.getUniqueKey)

        // For new remote state objects not represented locally, create and save these files.
        for (const stateObject of diffObjects.uniqueToRemote) {
          const savedFile = $_saveFileToDisk({parser, rootStore: this.rootStore, stateObject})
          jsonRes.push(savedFile)
          if (!isSilence) {
            this.log(`✅ Pulled and created new file from remote state: ${savedFile.filePath}`)
          }
        }

        // Check for conflicts between local and remote state objects.
        for (const item of localState) {
          const objInLocal = item.object
          const objInRemote = diffObjects.commonInRemote.find(
            (obj) => crd.getUniqueKey(obj) === crd.getUniqueKey(objInLocal),
          )!

          const diffs = await crd.$getPreviewPlan(objInRemote, objInLocal)

          if (diffs.length == 0) {
            if (!isSilence) {
              this.log(`\x1b[90m Skipping ${item.filePath} since it's in sync with remote state.\x1b[0m`)
            }
          }

          if (diffs.length > 0 && !this.flags.force) {
            if (!isSilence) {
              this.log(`🚨 Conflict found for ${item.filePath}. Use --force to override local changes.`)
            }
          }

          if (diffs.length > 0 && this.flags.force) {
            const savedFile = $_saveFileToDisk({
              parser,
              rootStore: this.rootStore,
              stateObject: objInRemote,
              overrideFilePath: item.filePath,
            })
            jsonRes.push(savedFile)
            if (!isSilence) {
              this.log(`✅💾 Remote state forcefully saved to file: ${savedFile.filePath}`)
            }
          }
        }
      }

      return jsonRes
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}

/* ---------------------------- $_saveFileToDisk ---------------------------- */

function $_saveFileToDisk({
  stateObject,
  rootStore,
  parser,
  overrideFilePath,
}: {
  overrideFilePath?: string
  rootStore: RootStore__Ready
  parser: IRCDParser
  stateObject: TypeOf<ICRD['StateSchema']>
}) {
  const stateFile = parser.parseStateObjectToFile(stateObject)

  let filePath = overrideFilePath || parser.buildFilePath(stateObject, rootStore)

  fs.mkdirSync(path.dirname(filePath), {recursive: true})
  fs.writeFileSync(filePath, stateFile)

  return {filePath, stateObject}
}
