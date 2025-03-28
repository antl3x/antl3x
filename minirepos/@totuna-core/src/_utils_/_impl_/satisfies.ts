/* satisfies.ts https://github.com/microsoft/TypeScript/issues/420 */

/* eslint-disable */

/* -------------------------------------------------------------------------- */
/*                            Module Type Checking                            */
/* -------------------------------------------------------------------------- */
// This is a hack to make sure that the module type is correct
/**
 * # Example
 * ```typescript UserManagement.ts
 *
 * import { satisfies } from 'satisfies'
 *
 * interface IUserManagement {
 *  addUser: () => boolean
 * }
 *
 * export const addUser = () => true
 *
 * satisfies<IUserManagement, typeof import('./test')>;
 * ```
 */

export function satisfies<U, T extends U>() {
  return 0 ?? (void 0 as T);
}
