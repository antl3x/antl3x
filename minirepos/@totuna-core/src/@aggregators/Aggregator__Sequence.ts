import { Privilege_On_Sequence } from "@/privileges/Privilege_On_Sequence";
import { AggregateFile, AggregatorModule } from "./@types";
import { satisfies } from "@/@utils/satisfies";

import parse from "parse-es-import";
import RJSON from "relaxed-json";

satisfies<AggregatorModule<Privilege_On_Sequence, Aggregates>, typeof import("./Agreggator__Sequence")>();

/* -------------------------------------------------------------------------- */
/*                                 Interfaces                                 */
/* -------------------------------------------------------------------------- */

export interface Aggregate {
  privileges: {
    [grantee: string]: Privilege_On_Sequence["privilege"][];
  };
  meta: {
    sequence: string;
    schema: string;
    database: string;
  };
}

export type Aggregates = Record<string, Aggregate>;

/* -------------------------------------------------------------------------- */
/*                             Transformation Sequences                       */
/* -------------------------------------------------------------------------- */

/* ---------------------------- aggregatesToFiles --------------------------- */

/** Generates SQL files from an aggregate object */
export const aggregatesToFiles = (aggregates: Aggregates): AggregateFile[] => {
  const aggregateFiles = [] as AggregateFile[];

  for (const key in aggregates) {
    const { meta, privileges } = aggregates[key];

    const fileName = `${meta.schema}.${meta.sequence}.ts`;

    let content = `export const privileges = ${JSON.stringify(privileges, null, 2)};\n\n`;
    content += `export const meta = ${JSON.stringify(meta, null, 2)};`;

    aggregateFiles.push({ fileName, content });
  }

  return aggregateFiles;
};

/* ------------------------- aggregatesToPrivileges ------------------------- */

/** Converts an aggregate object back to a state array */
export const aggregatesToPrivileges = (aggregates: Aggregates): Privilege_On_Sequence[] => {
  const privileges = [] as Privilege_On_Sequence[];

  for (const key in aggregates) {
    const { meta, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege of privs[grantee]) {
        privileges.push({
          "<type>": "Privilege_On_Sequence",
          grantee,
          privilege,
          database: meta.database,
          sequence: meta.sequence,
          schema: meta.schema,
        });
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

    const key = `${meta.schema}.${meta.sequence}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges = (files: string[]): Privilege_On_Sequence[] => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates = (privileges: Privilege_On_Sequence[]): Aggregates => {
  return privileges.reduce(
    (acc, privilege) => {
      const key = `${privilege.schema}.${privilege.sequence}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          meta: {
            sequence: privilege.sequence,
            schema: privilege.schema,
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

export const privilegesToFiles = (privileges: Privilege_On_Sequence[]): AggregateFile[] => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
