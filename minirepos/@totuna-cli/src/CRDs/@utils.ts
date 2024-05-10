import type {ICRD} from './ICRD.js'
import type {TypeOf} from 'zod'
import type {Delta} from 'jsondiffpatch'

export const diffStateObjects = <A extends TypeOf<ICRD['StateSchema']>[], B extends ICRD['getUniqueKey']>(
  remote: A,
  local: A,
  getUniqueKeyFn: B,
): {
  uniqueToRemote: A
  uniqueToLocal: A
  commonInLocal: A
  commonInRemote: A
} => {
  const res = {
    uniqueToRemote: [],
    uniqueToLocal: [],
    commonInLocal: [],
    commonInRemote: [],
  } as ReturnType<typeof diffStateObjects>

  // Creating maps to reduce lookup time complexity
  const localMap = new Map(local.map((obj) => [getUniqueKeyFn(obj), obj]))
  const remoteMap = new Map(remote.map((obj) => [getUniqueKeyFn(obj), obj]))

  for (const objRemote of remote) {
    const key = getUniqueKeyFn(objRemote)
    const objLocal = localMap.get(key)

    if (!objLocal) {
      res.uniqueToRemote.push(objRemote)
    } else {
      res.commonInRemote.push(objRemote)
      res.commonInLocal.push(objLocal) // Assume duplicates are managed
    }
  }

  for (const objLocal of local) {
    const key = getUniqueKeyFn(objLocal)
    if (!remoteMap.has(key)) {
      res.uniqueToLocal.push(objLocal)
    }
  }

  return res as any
}
