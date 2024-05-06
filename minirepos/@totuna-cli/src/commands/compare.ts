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
  static override description = 'Compare current local state with remote state.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    // let jsonRes = []
    try {
      for (const crd of Object.values(CRDs)) {
        const parser = CRDYAMLParsers[`CRDParser_${crd._kind_}_YAML`]
        const diff = await crd.$compare(parser)

        console.log(diff)
      }

      // return jsonRes
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
