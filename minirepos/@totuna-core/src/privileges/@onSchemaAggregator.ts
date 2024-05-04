import { StateSchema } from "privileges/@onSchemaPrivilege.js";
import { z } from "zod";

import parse from "parse-es-import";
import RJSON from "relaxed-json";
import { satisfies } from "_utils_/_@utils_.js";

import { module as atAggregator } from "./@aggregator.js";
import * as atOnSchemaPrivilege from "./@onSchemaPrivilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module extends atAggregator<_StateSchema, Record<string, AggregateObject>, "onSchema"> {}

satisfies<module, typeof import("./@onSchemaAggregator.js")>;

export type AggregateObject = {
  privileges: {
    [grantee: string]: StateSchema["privilege"][];
  };
  _meta_: {
    schema: StateSchema["schema"];
    database: StateSchema["database"];
  };
};

type _StateSchema = z.TypeOf<(typeof atOnSchemaPrivilege)["StateSchema"]>;

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const _metaId_ = "onSchema";

/* ---------------------------- genAggregatesFiles --------------------------- */

/** Generates SQL files from an aggregate object */
export const genAggregatesFiles: module["genAggregatesFiles"] = (aggregates) => {
  const aggregateFiles = [] as ReturnType<module["genAggregatesFiles"]>;

  for (const key in aggregates) {
    const { _meta_, privileges } = aggregates[key];

    const fileName = `${_meta_.schema}.ts`;

    const obj = {
      privileges,
      _meta_,
    };

    const content = `import { AggregateObject } from "@totuna/core/privileges/@onSchemaAggregator";\n
export default ${JSON.stringify(obj, null, 2)} satisfies AggregateObject; `;

    aggregateFiles.push({ fileName, content });
  }
  return aggregateFiles;
};

/* ------------------------- aggregatesToStates ------------------------- */

/** Converts an aggregate object back to a state array */
export const aggregatesToStates: module["aggregatesToStates"] = (aggregates) => {
  const privileges = [] as ReturnType<module["aggregatesToStates"]>;

  for (const key in aggregates) {
    const { _meta_, privileges: privs } = aggregates[key];

    for (const grantee in privs) {
      for (const privilege of privs[grantee]) {
        privileges.push(
          StateSchema.parse({
            ..._meta_,
            grantee,
            privilege,
          }),
        );
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

    const { _meta_, privileges } = file.default as AggregateObject;
    const key = `${_meta_.schema}`;

    if (!aggregates[key]) {
      aggregates[key] = {
        privileges,
        _meta_,
      };
    } else {
      for (const grantee in privileges) {
        if (!aggregates[key].privileges[grantee]) {
          aggregates[key].privileges[grantee] = [];
        }

        aggregates[key].privileges[grantee].push(...privileges[grantee]);
      }
    }
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
      const key = `${privilege.schema}`;

      if (!acc[key]) {
        acc[key] = {
          privileges: {},
          _meta_: {
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
    {} as ReturnType<module["statesToAggregates"]>,
  );
};

/* ---------------------------- statesToAggFiles --------------------------- */

export const statesToAggFiles: module["statesToAggFiles"] = (privileges) => {
  return genAggregatesFiles(statesToAggregates(privileges));
};
