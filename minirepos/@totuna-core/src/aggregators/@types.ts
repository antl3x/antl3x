/* -------------------------------------------------------------------------- */
/*                              Aggregator Module                             */
/* -------------------------------------------------------------------------- */

export interface AggregateFile {
  fileName: string;
  content: string;
}

export interface AggregatorModule<Privilege, Aggregates> {
  /** Converts a privileges array to an aggregates object */
  privilegesToAggregates(privileges: Privilege[]): Aggregates;

  /** Converts an aggregate object back to a privileges array */
  aggregatesToPrivileges(aggregates: Aggregates): Privilege[];

  /** Generates .ts files from an aggregate object */
  aggregatesToFiles(aggregates: Aggregates): AggregateFile[];

  /** Converts .ts files to an aggregate object */
  filesToAggregates(files: string[]): Aggregates;

  /** Converts .ts files to a privileges array */
  filesToPrivileges(files: string[]): Privilege[];

  /** Converts a privileges array to .ts files */
  privilegesToFiles(privileges: Privilege[]): AggregateFile[];

  /* -------------------------------------------------------------------------- */
}
