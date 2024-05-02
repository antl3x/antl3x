import { StateSchema } from "privileges/@onFunctionPrivilege.js";
import { z } from "zod";

import parse from "parse-es-import";
import RJSON from "relaxed-json";
import { satisfies } from "_utils_/@utils.js";

import { module as atAggregator } from "./@aggregator.js";
import * as atOnFunctionPrivilege from "./@onFunctionPrivilege.js";

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
          [grantee: string]: StateSchema["privilege"][];
        };
        meta: {
          function: string;
          schema: string;
          database: string;
        };
      }
    >,
    "onFunction"
  > {}

satisfies<module>()(import("./@onFunctionAggregator.js"));

type _StateSchema = z.TypeOf<(typeof atOnFunctionPrivilege)["StateSchema"]>;

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onFunction";

/* ---------------------------- aggregatesToFiles --------------------------- */

/** Generates SQL files from an aggregate object */
export const aggregatesToFiles: module["aggregatesToFiles"] = (aggregates) => {
  const aggregateFiles = [] as ReturnType<module["aggregatesToFiles"]>;

  for (const key in aggregates) {
    const { meta, privileges } = aggregates[key];

    const fileName = `${meta.schema}.${meta.function}.ts`;

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
            grantee,
            privilege,
            database: meta.database,
            function: meta.function,
            schema: meta.schema,
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
  type _ = ReturnType<module["filesToAggregates"]>;

  const aggregates = {} as _;

  for (const file of files) {
    const parsedFile = parse(file);

    const privileges = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "privileges")!.value) as _[0]["privileges"];
    const meta = RJSON.parse(parsedFile.exports.find((exp) => exp.moduleName === "meta")!.value) as _[0]["meta"];

    const key = `${meta.schema}.${meta.function}`;

    aggregates[key] = { privileges, meta };
  }

  return aggregates;
};

/* ---------------------------- filesToPrivileges --------------------------- */

export const filesToPrivileges = (files: string[]): StateSchema[] => {
  return aggregatesToPrivileges(filesToAggregates(files));
};

/* ------------------------- privilegesToAggregates ------------------------- */

export const privilegesToAggregates: module["privilegesToAggregates"] = (privileges) => {
  return privileges.reduce(
    (acc, privilege) => {
      const key = `${privilege.schema}.${privilege.function}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          meta: {
            function: privilege.function,
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
    {} as ReturnType<module["privilegesToAggregates"]>,
  );
};

/* ---------------------------- privilegesToFiles --------------------------- */

export const privilegesToFiles: module["privilegesToFiles"] = (privileges) => {
  return aggregatesToFiles(privilegesToAggregates(privileges));
};
