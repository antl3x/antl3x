import { Privilege_On_Table } from "@/privileges/Privilege_On_Table";
import { AggregateFile, AggregatorModule } from "./@types";
import { satisfies } from "@/utils/satisfies";

import parse from "parse-es-import";

satisfies<AggregatorModule<Privilege_On_Table, Aggregates>, typeof import("./Agreggator__Tables")>();

/* -------------------------------------------------------------------------- */
/*                                 Interfaces                                 */
/* -------------------------------------------------------------------------- */

export interface Aggregate {
  privileges: {
    [grantee: string]: Privilege_On_Table["privilege_type"][];
  };
  meta: {
    table_schema: Privilege_On_Table["table_schema"];
    table_name: Privilege_On_Table["table_name"];
    table_catalog: Privilege_On_Table["table_catalog"];
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

    const fileName = `${meta.table_schema}.${meta.table_name}.ts`;

    let content = `export const privileges = ${JSON.stringify(privileges, null, 2)};\n\n`;
    content += `export const meta = ${JSON.stringify(meta, null, 2)};`;

    aggregateFiles.push({ fileName, content });
  }

  return aggregateFiles;
};

/* ------------------------- aggregatesToPrivileges ------------------------- */

/** Converts an aggregate object back to a state array */
export const aggregatesToPrivileges = (aggregates: Aggregates): Privilege_On_Table[] => {
  const privileges = [] as Privilege_On_Table[];

  for (const key in aggregates) {
    const { meta, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege of privs[grantee]) {
        privileges.push({
          "<type>": "Privilege_On_Table",
          ...meta,
          grantee,
          privilege_type: privilege,
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

    const key = `${meta.table_schema}.${meta.table_name}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges = (files: string[]): Privilege_On_Table[] => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates = (privileges: Privilege_On_Table[]): Aggregates => {
  return privileges.reduce(
    (acc, privilege) => {
      const key = `${privilege.table_schema}.${privilege.table_name}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          meta: {
            table_schema: privilege.table_schema,
            table_name: privilege.table_name,
            table_catalog: privilege.table_catalog,
          },
        };
      }

      if (!acc[key].privileges[privilege.grantee]) {
        acc[key].privileges[privilege.grantee] = [];
      }

      acc[key].privileges[privilege.grantee].push(privilege.privilege_type);

      return acc;
    },
    {} as Record<string, Aggregate>,
  );
};

/* ---------------------------- privilegesToFiles --------------------------- */

export const privilegesToFiles = (privileges: Privilege_On_Table[]): AggregateFile[] => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
