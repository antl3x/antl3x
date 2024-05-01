import { StateSchema as onTableSS } from "@privileges/@onTable";
import { StateSchema as onColumnSS } from "@privileges/@onColumn";
import { TypeOf } from "zod";

/* -------------------------------------------------------------------------- */
/*                              Aggregator Module                             */
/* -------------------------------------------------------------------------- */

export interface AggregateFile {
  fileName: string;
  content: string;
}

type PrivilegeSchemas = TypeOf<typeof onTableSS | typeof onColumnSS>;

export interface defAggregatorModule<PrivilegeSchema extends PrivilegeSchemas, Aggregates> {
  /** Converts a privileges array to an aggregates object */
  privilegesToAggregates(privileges: PrivilegeSchema[]): Aggregates;

  /** Converts an aggregate object back to a privileges array */
  aggregatesToPrivileges(aggregates: Aggregates): PrivilegeSchema[];

  /** Generates .ts files from an aggregate object */
  aggregatesToFiles(aggregates: Aggregates): AggregateFile[];

  /** Converts .ts files to an aggregate object */
  filesToAggregates(files: string[]): Aggregates;

  /** Converts .ts files to a privileges array */
  filesToPrivileges(files: string[]): PrivilegeSchema[];

  /** Converts a privileges array to .ts files */
  privilegesToFiles(privileges: PrivilegeSchema[]): AggregateFile[];

  /* -------------------------------------------------------------------------- */
}
