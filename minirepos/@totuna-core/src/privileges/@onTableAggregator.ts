import { StateSchema } from "privileges/@onTablePrivilege.js";
import { z } from "zod";

import parse from "parse-es-import";
import RJSON from "relaxed-json";
import { satisfies } from "_utils_/@utils.js";

import { module as atAggregator } from "./@aggregator.js";
import * as atOnTablePrivilege from "./@onTablePrivilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module
  extends atAggregator<
    _StateSchema,
    Record<
      string,
      {
        privileges: {
          [grantee: string]: StateSchema["privilege_type"][];
        };
        meta: {
          table_schema: StateSchema["table_schema"];
          table_name: StateSchema["table_name"];
          database: StateSchema["database"];
        };
      }
    >
  > {}

satisfies<module>()(import("./@onTableAggregator.js"));

type _StateSchema = z.TypeOf<(typeof atOnTablePrivilege)["StateSchema"]>;

/* -------------------------------------------------------------------------- */
/*                             Transformation Functions                       */
/* -------------------------------------------------------------------------- */

/* ---------------------------- aggregatesToFiles --------------------------- */

/** Generates SQL files from an aggregate object */
export const aggregatesToFiles: module["aggregatesToFiles"] = (aggregates) => {
  const aggregateFiles = [] as ReturnType<module["aggregatesToFiles"]>;

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
  const privileges = [] as ReturnType<module["aggregatesToPrivileges"]>;

  for (const key in aggregates) {
    const { meta, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege of privs[grantee]) {
        privileges.push(
          StateSchema.parse({
            ...meta,
            grantee,
            privilege_type: privilege,
          }),
        );
      }
    }
  }

  return privileges;
};

/* ---------------------------- filesToAggregates --------------------------- */

/** Generates AggregateFiles from a files array */
export const filesToAggregates: module["filesToAggregates"] = (files) => {
  type _return = ReturnType<module["filesToAggregates"]>;
  const aggregates = {} as _return;

  for (const file of files) {
    const parsedFile = parse(file);

    const privileges = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "privileges")!.value) as _return[0]["privileges"];
    const meta = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "meta")!.value) as _return[0]["meta"];

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

      if (!acc[key].privileges[privilege.grantee]) {
        acc[key].privileges[privilege.grantee] = [];
      }

      acc[key].privileges[privilege.grantee].push(privilege.privilege_type);

      return acc;
    },
    {} as ReturnType<module["privilegesToAggregates"]>,
  );
};

/* ---------------------------- privilegesToFiles --------------------------- */

export const privilegesToFiles: module["privilegesToFiles"] = (privileges) => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
