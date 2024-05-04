import { satisfies } from "_utils_/_@utils_.js";
import { z } from "zod";

import { File, module as atAggregator } from "./@aggregator.js";
import * as atOnColumnPrivilege from "./@onColumnPrivilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module, typeof import("./@onColumnAggregator.js")>;

export interface module
  extends atAggregator<z.TypeOf<(typeof atOnColumnPrivilege)["StateSchema"]>, Record<string, AggregateObject>, "onColumn"> {}

export type AggregateObject = {
  privileges: {
    [grantee: string]: {
      [privilege_type in z.TypeOf<typeof atOnColumnPrivilege.StateSchema>["privilege_type"]]?: string[];
    };
  };
  _meta_: {
    table_schema: string;
    table_name: string;
    database: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onColumn";

/* ---------------------------- genAggregatesFiles --------------------------- */

/** Generates .ts files from an aggregate object */
export const genAggregatesFiles: module["genAggregatesFiles"] = (aggregates) => {
  const aggregateFiles = [] as File[];

  for (const key in aggregates) {
    const { _meta_, privileges } = aggregates[key];

    const fileName = `${_meta_.table_schema}.${_meta_.table_name}.ts`;

    const obj = {
      privileges,
      _meta_,
    };

    const content = `import { AggregateObject } from "@totuna/core/privileges/@onColumnAggregator";\n
export default ${JSON.stringify(obj, null, 2)} satisfies AggregateObject; `;

    aggregateFiles.push({ fileName, content });
  }

  return aggregateFiles;
};

/* ------------------------- aggregatesToStates ------------------------- */

/** Converts an aggregate object back to a state array */
export const aggregatesToStates: module["aggregatesToStates"] = (aggregates) => {
  const privileges = [] as z.TypeOf<typeof atOnColumnPrivilege.StateSchema>[];

  for (const key in aggregates) {
    const { _meta_, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege_type in privs[grantee]) {
        const privilegeType = privilege_type as keyof (typeof privs)[typeof grantee];
        for (const column_name of privs[grantee][privilegeType]!) {
          privileges.push(
            atOnColumnPrivilege.StateSchema.parse({
              ..._meta_,
              grantee,
              column_name,
              privilege_type,
            }),
          );
        }
      }
    }
  }

  return privileges;
};

/* ---------------------------- filesToAggregates --------------------------- */

/** Generates AggregateFiles from a files array */
export const filesToAggregates: module["filesToAggregates"] = async (files) => {
  const aggregates = {} as Awaited<ReturnType<module["filesToAggregates"]>>;

  for (const [path] of files) {
    const file = await import(path);

    const def = file.default as AggregateObject;

    const key = `${def._meta_.table_schema}.${def._meta_.table_name}`;

    aggregates[key] = def;
  }

  return aggregates;
};

/* ---------------------------- aggFilesToStates --------------------------- */

export const aggFilesToStates: module["aggFilesToStates"] = async (files) => {
  return aggregatesToStates(await filesToAggregates(files));
};

/* ------------------------- statesToAggregates ------------------------- */

export const statesToAggregates: module["statesToAggregates"] = (privileges) => {
  return privileges.reduce(
    (acc, privilege) => {
      const key = `${privilege.table_schema}.${privilege.table_name}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          _meta_: {
            table_schema: privilege.table_schema,
            table_name: privilege.table_name,
            database: privilege.database,
          },
        };
      }

      const { grantee, privilege_type, column_name } = privilege;

      if (!acc[key].privileges[grantee]) {
        acc[key].privileges[grantee] = {};
      }

      if (!acc[key].privileges[grantee][privilege_type]) {
        acc[key].privileges[grantee][privilege_type] = [];
      }

      acc[key].privileges[grantee][privilege_type]!.push(column_name);
      return acc;
    },
    {} as ReturnType<module["statesToAggregates"]>,
  );
};

/* ---------------------------- statesToAggFiles --------------------------- */

export const statesToAggFiles: module["statesToAggFiles"] = (privileges) => {
  return genAggregatesFiles(statesToAggregates(privileges));
};
