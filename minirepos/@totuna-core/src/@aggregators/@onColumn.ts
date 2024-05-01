import { satisfies } from "@utils";
import { StateSchema } from "@privileges/@onColumn";

import parse from "parse-es-import";
import RJSON from "relaxed-json";

import { AggregateFile, defAggregatorModule } from "./_impl_/types";

satisfies<defAggregatorModule<StateSchema, Aggregates>, typeof import("@aggregators/@onColumn")>();

/* -------------------------------------------------------------------------- */
/*                                 Interfaces                                 */
/* -------------------------------------------------------------------------- */

export interface Aggregate {
  privileges: {
    [grantee: string]: {
      [privilege: StateSchema["privilege_type"]]: string[];
    };
  };
  meta: {
    table_schema: StateSchema["table_schema"];
    table_name: StateSchema["table_name"];
    database: StateSchema["database"];
  };
}

export type Aggregates = Record<string, Aggregate>;

/* -------------------------------------------------------------------------- */
/*                             Transformation Functions                       */
/* -------------------------------------------------------------------------- */

/* ---------------------------- aggregatesToFiles --------------------------- */

/** Generates .ts files from an aggregate object */
export const aggregatesToFiles = (aggregates: Aggregates): AggregateFile[] => {
  const aggregateFiles = [] as AggregateFile[];

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
export const aggregatesToPrivileges = (aggregates: Aggregates): StateSchema[] => {
  const privileges = [] as StateSchema[];

  for (const key in aggregates) {
    const { meta, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege_type in privs[grantee]) {
        for (const column_name of privs[grantee][privilege_type]) {
          privileges.push(
            StateSchema.parse({
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
export const filesToAggregates = (files: string[]): Aggregates => {
  const aggregates = {} as Aggregates;

  for (const file of files) {
    const parsedFile = parse(file);

    const privileges = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "privileges")!.value) as Aggregate["privileges"];
    const meta = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "meta")!.value) as Aggregate["meta"];

    const key = `${meta.table_schema}.${meta.table_name}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges = (files: string[]): StateSchema[] => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates = <T extends StateSchema[]>(privileges: T): Aggregates => {
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
    {} as Record<string, Aggregate>,
  );
};

/* ---------------------------- privilegesToFiles --------------------------- */

export const privilegesToFiles = (privileges: StateSchema[]): AggregateFile[] => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
