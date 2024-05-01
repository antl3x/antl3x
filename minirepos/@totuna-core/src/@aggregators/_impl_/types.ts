import { StateSchema as onTableSS } from "@privileges/@onTable";
import { StateSchema as onFunctionSS } from "@privileges/@onFunction";
import { StateSchema as onColumnSS } from "@privileges/@onColumn";
import { StateSchema as onDatabaseSS } from "@privileges/@onDatabase";
import { StateSchema as onViewSS } from "@privileges/@onView";
import { StateSchema as onSchemaSS } from "@privileges/@onSchema";
import { StateSchema as onSequenceSS } from "@privileges/@onSequence";
import { TypeOf } from "zod";

/* -------------------------------------------------------------------------- */
/*                              Aggregator Module                             */
/* -------------------------------------------------------------------------- */

export interface AggregateFile {
  fileName: string;
  content: string;
}

type PrivilegeSchemas = TypeOf<
  | typeof onTableSS
  | typeof onColumnSS
  | typeof onFunctionSS
  | typeof onDatabaseSS
  | typeof onViewSS
  | typeof onSchemaSS
  | typeof onSequenceSS
>;

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