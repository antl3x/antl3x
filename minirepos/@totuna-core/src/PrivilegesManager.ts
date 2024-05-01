import fs from "fs";
import { Model, _async, _await, model, modelAction, modelFlow } from "mobx-keystone";
import { TypeOf } from "zod";
import { rootCtx } from "./RootCtx";
import {
  Agreggator__Tables,
  Aggregator__Columns,
  Aggregator__Schema,
  Aggregator__Database,
  Aggregator__View,
  Aggregator__Function,
  Aggregator__Sequence,
} from "./aggregators";
import { getZodTypeIdentifier } from "./@utils";
import { PRIVILEGE, PRIVILEGES_MAP } from "./privileges/PRIVILEGES_MAP";

/* -------------------------------------------------------------------------- */
/*                              PrivilegesManager                             */
/* -------------------------------------------------------------------------- */

@model("@totuna/PrivilegesManager")
export class PrivilegesManager extends Model({}) {
  /* -------------------------------- pullPrivilege ------------------------------- */

  // INFO: Pull will override all the existing privileges files and replaces them with the current db state.
  @modelFlow
  pullPrivilege = _async(function* (this: PrivilegesManager, privilege: PRIVILEGE) {
    const ctx = rootCtx.get(this);

    const { rows } = yield* _await(privilege.query(ctx!.pgPool.query.bind(ctx!.pgPool), ctx));

    const typeID = getZodTypeIdentifier(privilege.zodSchema) as string;

    const privileges = rows.map((i) => privilege.zodSchema.parse(i)) as PRIVILEGE["zodSchema"][];

    const filePath = ctx!.SystemVariables[`STATE_FILES_${typeID.toUpperCase()}_PATH` as never];

    // Remove all state files first
    if (fs.existsSync(filePath)) {
      fs.rmSync(ctx!.SystemVariables.STATE_FILES_FOLDER_PATH, { recursive: true });
    }

    fs.mkdirSync(ctx!.SystemVariables.STATE_FILES_FOLDER_PATH, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(privileges, null, 2));

    this._aggregatePrivileges(privilege, privileges);

    return privileges as TypeOf<PRIVILEGES_MAP[keyof PRIVILEGES_MAP]["zodSchema"]>[];
  });

  @modelAction
  protected _aggregatePrivileges<P extends PRIVILEGE>(privilege: P, privileges: TypeOf<P["zodSchema"]>[]) {
    const ctx = rootCtx.get(this);

    const typeID = getZodTypeIdentifier(privilege.zodSchema)?.toUpperCase() as keyof typeof Aggregators;

    console.log(`Aggregating ${typeID}...`);

    const Aggregators = {
      PRIVILEGE_ON_TABLE: [Agreggator__Tables],
      PRIVILEGE_ON_COLUMN: [Aggregator__Columns],
      PRIVILEGE_ON_SCHEMA: [Aggregator__Schema],
      PRIVILEGE_ON_DATABASE: [Aggregator__Database],
      PRIVILEGE_ON_VIEW: [Aggregator__View],
      PRIVILEGE_ON_FUNCTION: [Aggregator__Function],
      PRIVILEGE_ON_SEQUENCE: [Aggregator__Sequence],
    } as const;

    const folderPath = ctx!.SystemVariables[`${typeID}_PATH`];

    const [aggregator] = Aggregators[typeID];
    const aggregated = aggregator.privilegesToAggregates(privileges);

    // @ts-expect-error Validated by Aggregators
    const files = aggregator.aggregatesToFiles(aggregated);
    fs.mkdirSync(folderPath, { recursive: true });

    if (files.length > 0) {
      files.forEach((file) => {
        fs.writeFileSync(folderPath + "/" + file.fileName, file.content);
      });
    } else {
      // Delete all files in the folder, and keep folder empty
      if (!fs.existsSync(folderPath)) return;
      fs.readdirSync(folderPath).forEach((file) => {
        fs.unlinkSync(folderPath + "/" + file);
      });
    }
  }

  @modelFlow
  pullPrivileges = _async(function* (this: PrivilegesManager) {
    for (const [, value] of Object.entries(PRIVILEGES_MAP)) {
      yield* _await(this.pullPrivilege(value));
    }
  });

  @modelFlow
  pushPrivileges = _async(function* (this: PrivilegesManager) {
    for (const [, value] of Object.entries(PRIVILEGES_MAP)) {
      yield* _await(this.pushPrivilege(value));
    }
  });

  @modelFlow
  pushPrivilege = _async(function* (this: PrivilegesManager, privilege: PRIVILEGE) {
    const ctx = rootCtx.get(this);
    const typeID = getZodTypeIdentifier(privilege.zodSchema).toUpperCase() as keyof typeof Aggregators;

    const internalJsonStateFilePath = ctx!.SystemVariables[`STATE_FILES_${typeID.toUpperCase()}_PATH` as never];

    const privileges = JSON.parse(fs.readFileSync(internalJsonStateFilePath, "utf-8")) as TypeOf<
      PRIVILEGES_MAP[keyof PRIVILEGES_MAP]["zodSchema"]
    >[];

    const Aggregators = {
      PRIVILEGE_ON_TABLE: [Agreggator__Tables],
      PRIVILEGE_ON_COLUMN: [Aggregator__Columns],
      PRIVILEGE_ON_SCHEMA: [Aggregator__Schema],
      PRIVILEGE_ON_DATABASE: [Aggregator__Database],
      PRIVILEGE_ON_VIEW: [Aggregator__View],
      PRIVILEGE_ON_FUNCTION: [Aggregator__Function],
      PRIVILEGE_ON_SEQUENCE: [Aggregator__Sequence],
    } as const;

    const tsFilesPath = ctx!.SystemVariables[`${typeID}_PATH`];

    const tsFilesPaths = fs.readdirSync(tsFilesPath);

    const aggregator = Aggregators[typeID][0];

    const tsFiles = [] as string[];
    tsFilesPaths.forEach((file) => {
      tsFiles.push(fs.readFileSync(tsFilesPath + "/" + file, "utf-8"));
    });

    const aggregates = aggregator.filesToPrivileges(tsFiles);
    

    console.log(diff);

    const { rows } = yield* _await(ctx!.pgPool.query(`SELECT 1;`));

    return rows;
  });
}
