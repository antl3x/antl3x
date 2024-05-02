import { satisfies } from "_utils_/@utils.js";
import { z } from "zod";
import parse from "parse-es-import";
import RJSON from "relaxed-json";

import { File, module as atAggregator } from "./@aggregator.js";
import * as atOnColumnPrivilege from "./@onColumnPrivilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module
  extends atAggregator<
    z.TypeOf<(typeof atOnColumnPrivilege)["StateSchema"]>,
    Record<
      string,
      {
        privileges: {
          [grantee: string]: {
            [privilege: string]: z.TypeOf<typeof atOnColumnPrivilege.StateSchema>[];
          };
        };
        meta: {
          table_schema: string;
          table_name: string;
          database: string;
        };
      }
    >
  > {}

satisfies<module>()(import("./@onColumnAggregator.js"));

/* -------------------------------------------------------------------------- */
/*                             Transformation Functions                       */
/* -------------------------------------------------------------------------- */

/* ---------------------------- aggregatesToFiles --------------------------- */

/** Generates .ts files from an aggregate object */
export const aggregatesToFiles: module["aggregatesToFiles"] = (aggregates) => {
  const aggregateFiles = [] as File[];

  for (const key in aggregates) {
    const { meta, privileges } = aggregates[key];

    const fileName = `${meta.table_schema}.${meta.table_name}.ts`;

    let content = `export const privileges = ${JSON.stringify(privileges, null, 2)};\n\n`;
    content += `export const meta = ${JSON.stringify(meta, null, 2)};`;

    aggregateFiles.push({ fileName, content });
  }

  return aggregateFiles;
};

/* ------------------------- aggregatesToPrivileges ------------------------- */

/** Converts an aggregate object back to a state array */
export const aggregatesToPrivileges: module["aggregatesToPrivileges"] = (aggregates) => {
  const privileges = [] as z.TypeOf<typeof atOnColumnPrivilege.StateSchema>[];

  for (const key in aggregates) {
    const { meta, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege_type in privs[grantee]) {
        for (const column_name of privs[grantee][privilege_type]) {
          privileges.push(
            atOnColumnPrivilege.StateSchema.parse({
              ...meta,
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
export const filesToAggregates: module["filesToAggregates"] = (files) => {
  const aggregates = {} as ReturnType<module["filesToAggregates"]>;

  for (const file of files) {
    const parsedFile = parse(file);

    const privileges = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "privileges")!.value);
    const meta = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "meta")!.value) as ReturnType<
      module["filesToAggregates"]
    >["meta"]["meta"];

    const key = `${meta.table_schema}.${meta.table_name}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges: module["filesToPrivileges"] = (files) => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates: module["privilegesToAggregates"] = (privileges) => {
  return privileges.reduce(
    (acc, privilege) => {
      const key = `${privilege.table_schema}.${privilege.table_name}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          meta: {
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

      acc[key].privileges[grantee][privilege_type].push(column_name);

      return acc;
    },
    {} as ReturnType<module["privilegesToAggregates"]>,
  );
};

/* ---------------------------- privilegesToFiles --------------------------- */

export const privilegesToFiles: module["privilegesToFiles"] = (privileges) => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
