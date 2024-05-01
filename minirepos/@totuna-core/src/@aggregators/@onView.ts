import { StateSchema } from "@privileges/@onView.js";
import { satisfies } from "@utils/index.js";

import { AggregateFile, defAggregatorModule } from "./_impl_/types.js";

import parse from "parse-es-import";
import RJSON from "relaxed-json";

satisfies<defAggregatorModule<StateSchema, Aggregates>, typeof import("@aggregators/@onView.js")>();

/* -------------------------------------------------------------------------- */
/*                                 Interfaces                                 */
/* -------------------------------------------------------------------------- */

export interface Aggregate {
  privileges: {
    [grantee: string]: StateSchema["privilege"][];
  };
  meta: {
    schema: StateSchema["schema"];
    view: StateSchema["view"];
    database: StateSchema["database"];
  };
}

export type Aggregates = Record<string, Aggregate>;

/* -------------------------------------------------------------------------- */
/*                             Transformation Functions                       */
/* -------------------------------------------------------------------------- */

/* ---------------------------- aggregatesToFiles --------------------------- */

/** Generates SQL files from an aggregate object */
export const aggregatesToFiles = (aggregates: Aggregates): AggregateFile[] => {
  const aggregateFiles = [] as AggregateFile[];

  for (const key in aggregates) {
    const { meta, privileges } = aggregates[key];

    const fileName = `${meta.schema}.${meta.view}.ts`;

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
      for (const privilege of privs[grantee]) {
        privileges.push(
          StateSchema.parse({
            "<type>": "StateSchema",
            ...meta,
            grantee,
            privilege: privilege,
          }),
        );
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

    const key = `${meta.schema}.${meta.view}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges = (files: string[]): StateSchema[] => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates = (privileges: StateSchema[]): Aggregates => {
  return privileges.reduce(
    (acc, privilege) => {
      const key = `${privilege.schema}.${privilege.view}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          meta: {
            schema: privilege.schema,
            view: privilege.view,
            database: privilege.database,
          },
        };
      }

      if (!acc[key].privileges[privilege.grantee]) {
        acc[key].privileges[privilege.grantee] = [];
      }

      acc[key].privileges[privilege.grantee].push(privilege.privilege);

      return acc;
    },
    {} as Record<string, Aggregate>,
  );
};

/* ---------------------------- privilegesToFiles --------------------------- */

export const privilegesToFiles = (privileges: StateSchema[]): AggregateFile[] => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
