import { Privilege_On_View } from "@/privileges/Privilege_On_View";
import { AggregateFile, AggregatorModule } from "./@types";
import { satisfies } from "@/utils/satisfies";

import parse from "parse-es-import";

satisfies<AggregatorModule<Privilege_On_View, Aggregates>, typeof import("@/aggregators/Aggregator__View")>();

/* -------------------------------------------------------------------------- */
/*                                 Interfaces                                 */
/* -------------------------------------------------------------------------- */

export interface Aggregate {
  privileges: {
    [grantee: string]: Privilege_On_View["privilege"][];
  };
  meta: {
    schema: Privilege_On_View["schema"];
    view: Privilege_On_View["view"];
    database: Privilege_On_View["database"];
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
export const aggregatesToPrivileges = (aggregates: Aggregates): Privilege_On_View[] => {
  const privileges = [] as Privilege_On_View[];

  for (const key in aggregates) {
    const { meta, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege of privs[grantee]) {
        privileges.push({
          "<type>": "Privilege_On_View",
          ...meta,
          grantee,
          privilege: privilege,
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

    const privileges = JSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "privileges")!.value);
    const meta = JSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "meta")!.value);

    const key = `${meta.schema}.${meta.view}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges = (files: string[]): Privilege_On_View[] => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates = (privileges: Privilege_On_View[]): Aggregates => {
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

export const privilegesToFiles = (privileges: Privilege_On_View[]): AggregateFile[] => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
