import type * as atPrivileges from "./@privileges.js";
import type { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

type PrivilegeStateSchema = z.TypeOf<(typeof atPrivileges)[keyof typeof atPrivileges]["StateSchema"]>;

export interface module<PrivilegeSchema extends PrivilegeStateSchema, Aggregates, _metaId_> {
  readonly _metaId_: _metaId_;

  /** Converts a privileges array to an aggregates object */
  privilegesToAggregates(privileges: PrivilegeSchema[]): Aggregates;

  /** Converts an aggregate object back to a privileges array */
  aggregatesToPrivileges(aggregates: Aggregates): PrivilegeSchema[];

  /** Generates .ts files from an aggregate object */
  aggregatesToFiles(aggregates: Aggregates): File[];

  /** Converts .ts files to an aggregate object */
  filesToAggregates(files: string[]): Aggregates;

  /** Converts .ts files to a privileges array */
  filesToPrivileges(files: string[]): PrivilegeSchema[];

  /** Converts a privileges array to .ts files */
  privilegesToFiles(privileges: PrivilegeSchema[]): File[];

  /* -------------------------------------------------------------------------- */
}

export interface File {
  fileName: string;
  content: string;
}
