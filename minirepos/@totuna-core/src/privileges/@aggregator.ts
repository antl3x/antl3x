import type * as atPrivileges from "./@privileges.js";
import type { z } from "zod";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

type PrivilegeStateSchema = z.TypeOf<(typeof atPrivileges)[keyof typeof atPrivileges]["StateSchema"]>;

export interface module<PrivilegeSchema extends PrivilegeStateSchema, Aggregates, _metaId_> {
  readonly _metaId_: _metaId_;

  /** Converts a privileges array to an aggregates object */
  statesToAggregates(privileges: PrivilegeSchema[]): Aggregates;

  /** Converts an aggregate object back to a privileges array */
  aggregatesToStates(aggregates: Aggregates): PrivilegeSchema[];

  /** Generates .ts files from an aggregate object */
  genAggregatesFiles(aggregates: Aggregates): File[];

  /** Converts .ts files to an aggregate object */
  filesToAggregates(files: [path: string, content: string][]): Promise<Aggregates>;

  /** Converts .ts files to a privileges array */
  aggFilesToStates(files: [path: string, content: string][]): Promise<PrivilegeSchema[]>;

  /** Converts a privileges array to .ts files */
  statesToAggFiles(privileges: PrivilegeSchema[]): File[];

  /* -------------------------------------------------------------------------- */
}

export interface File {
  fileName: string;
  content: string;
}
