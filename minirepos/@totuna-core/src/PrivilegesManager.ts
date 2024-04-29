import fs from "fs";
import { Model, _async, _await, model, modelAction, modelFlow } from "mobx-keystone";
import { TypeOf } from "zod";
import { rootCtx } from "./RootCtx";
import { Agreggator__Tables, Aggregator__Columns, Aggregator__Schema } from "./aggregators";
import { getZodTypeIdentifier } from "./utils";
import { PRIVILEGE, PRIVILEGES_MAP } from "./privileges/PRIVILEGES_MAP";

/* -------------------------------------------------------------------------- */
/*                              PrivilegesManager                             */
/* -------------------------------------------------------------------------- */

@model("@totuna/PrivilegesManager")
export class PrivilegesManager extends Model({}) {
  /* -------------------------------- pullPrivilege ------------------------------- */

  @modelFlow
  pullPrivilege = _async(function* (this: PrivilegesManager, privilege: PRIVILEGE) {
    const ctx = rootCtx.get(this);

    const { rows } = yield* _await(privilege.query(ctx!.pgPool.query.bind(ctx!.pgPool), ctx));

    const typeID = getZodTypeIdentifier(privilege.zodSchema) as string;

    const privileges = rows.map((i) => privilege.zodSchema.parse(i)) as PRIVILEGE["zodSchema"][];

    const filePath = ctx!.SystemVariables[`STATE_FILES_${typeID.toUpperCase()}_PATH` as never];

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
      PRIVILEGE_ON_TABLE: [Agreggator__Tables, ctx!.config.folderNames.privilegesOnTablePath],
      PRIVILEGE_ON_COLUMN: [Aggregator__Columns, ctx!.config.folderNames.privilegesOnColumnPath],
      PRIVILEGE_ON_SCHEMA: [Aggregator__Schema, ctx!.config.folderNames.privilegesOnSchemaPath],
    } as const;

    const [aggregator, folderPath] = Aggregators[typeID];
    const aggregated = aggregator.privilegesToAggregates(privileges);

    // @ts-expect-error Validated by Aggregators
    const files = aggregator.aggregatesToFiles(aggregated);

    files.forEach((file) => {
      fs.mkdirSync(folderPath, { recursive: true });
      fs.writeFileSync(folderPath + "/" + file.fileName, file.content);
    });
  }

  @modelFlow
  pullPrivileges = _async(function* (this: PrivilegesManager) {
    for (const [, value] of Object.entries(PRIVILEGES_MAP)) {
      yield* _await(this.pullPrivilege(value));
    }
  });
}
