import fs from "fs";
import { Model, model, modelFlow, _async, _await } from "mobx-keystone";
import { rootCtx } from "./RootCtx";
import path from "path";
import { PrivilegesTables } from "@/@types";

@model("@totuna/Privileges/SyncEngine")
export class PrivilegesSyncEngine extends Model({}) {
  /* -------------------------------------------------------------------------- */
  /*                               pullPrivileges                               */
  /* -------------------------------------------------------------------------- */

  @modelFlow
  pullPrivileges = _async(function* (this: PrivilegesSyncEngine) {
    const ctx = rootCtx.get(this);

    const { rows: currentPrivileges } = yield* _await(
      ctx!.pgPool.query(
        `SELECT table_name, grantee, privilege_type
                          FROM information_schema.table_privileges
                          WHERE table_schema = $1;`,
        [ctx!.config.schemaName]
      )
    );

    // Create a map to store the privileges for each table and role
    const privilegesMap = new Map<string, Map<string, Set<string>>>();
    currentPrivileges.forEach(({ table_name, grantee, privilege_type }) => {
      if (!privilegesMap.has(table_name)) {
        privilegesMap.set(table_name, new Map());
      }
      const tablePrivileges = privilegesMap.get(table_name)!;

      if (!tablePrivileges.has(grantee)) {
        tablePrivileges.set(grantee, new Set());
      }
      tablePrivileges.get(grantee)!.add(privilege_type);
    });

    // Generate the TypeScript code for the privileges object

    const typesPathRelative = path.relative(
      ctx!.config.folderNames.privilegesPath,
      ctx!.config.folderNames.typesPath
    );

    let code = `import { PrivilegesTables } from '${typesPathRelative}';\n\n`;
    code += "export const privileges: PrivilegesTables = {\n";

    for (const [tableName, tablePrivileges] of privilegesMap.entries()) {
      code += `  ${tableName}: {\n`;

      for (const [roleName, rolePrivileges] of tablePrivileges.entries()) {
        code += `    "${roleName}": [${Array.from(rolePrivileges)
          .map((p) => `'${p}'`)
          .join(", ")}],\n`;
      }

      code += `  },\n`;
    }

    code += "};\n";

    const filePath =
      ctx!.config.folderNames.privilegesPath +
      "/" +
      ctx!.config.fileNames.privilegesTable;

    // Write the generated code to the Table.privileges.ts file

    fs.mkdirSync(ctx!.config.folderNames.privilegesPath, { recursive: true });
    fs.writeFileSync(filePath, code);
  });

  /* -------------------------------------------------------------------------- */
  /*                                    sync                                    */
  /* -------------------------------------------------------------------------- */

  async sync(): Promise<void> {
    const ctx = rootCtx.get(this);
    const schemaName = ctx!.config.schemaName;
    const db = ctx!.pgPool;
    const filePath = path.join(
      ctx!.config.folderNames.privilegesPath,
      ctx!.config.fileNames.privilegesTable
    );

    // Check if the privileges file exists
    if (!fs.existsSync(filePath)) {
      // Pull the privileges from the database
      await this.pullPrivileges();
    }

    const { privileges: desiredPrivileges } = await import(filePath);

    try {
      await ctx!.pgPool.query("BEGIN");

      // Fetch the current privileges at the schema level from the database
      const { rows: currentPrivileges } = await db.query(
        `
          SELECT table_name, grantee, privilege_type
          FROM information_schema.table_privileges
          WHERE table_schema = $1
        `,
        [schemaName]
      );

      // Create a PrivilegesTables object to store the current privileges
      const currentPrivilegesMap: PrivilegesTables = {};
      currentPrivileges.forEach(({ table_name, grantee, privilege_type }) => {
        if (!currentPrivilegesMap[table_name]) {
          currentPrivilegesMap[table_name] = {};
        }
        if (!currentPrivilegesMap[table_name][grantee]) {
          currentPrivilegesMap[table_name][grantee] = [];
        }
        currentPrivilegesMap[table_name][grantee].push(privilege_type);
      });

      // Generate the SQL statements to synchronize the privileges
      const sqlStatements = this._diffPrivilegesTables({
        oldPrivileges: currentPrivilegesMap,
        newPrivileges: desiredPrivileges,
      });

      // Execute the SQL statements
      for (const sqlStatement of sqlStatements) {
        await db.query(sqlStatement);
      }

      if (sqlStatements.length === 0) {
        console.log("No changes detected.");
        return;
      }

      // Write the SQL statements to a file
      fs.mkdirSync(ctx!.config.folderNames.executionsPath, { recursive: true });
      fs.writeFileSync(
        path.join(
          ctx!.config.folderNames.executionsPath,
          ctx!.config.fileNames.executionSQL()
        ),
        `-- Sync privileges\nBEGIN;\n${sqlStatements.join("\n")}\nCOMMIT;`
      );

      console.log("Sync successfully.");

      await db.query("COMMIT");
    } catch (err) {
      await db.query("ROLLBACK");
      throw err;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                            _diffPrivilegesTables                           */
  /* -------------------------------------------------------------------------- */

  private _diffPrivilegesTables({
    oldPrivileges,
    newPrivileges,
  }: {
    oldPrivileges: PrivilegesTables;
    newPrivileges: PrivilegesTables;
  }): string[] {
    const sqlStatements: string[] = [];
    const schemaName = rootCtx.get(this)!.config.schemaName;

    // Iterate over each table in the new privileges
    for (const tableName in newPrivileges) {
      const newPrivilegesTables = newPrivileges[tableName];
      const oldPrivilegesTables = oldPrivileges[tableName] || {};

      // Iterate over each role in the new table privileges
      for (const roleName in newPrivilegesTables) {
        const newRolePrivileges = newPrivilegesTables[roleName];
        const oldRolePrivileges = oldPrivilegesTables[roleName] || [];

        // Determine privileges to grant
        const privilegesToGrant = newRolePrivileges.filter(
          (privilege) => !oldRolePrivileges.includes(privilege)
        );
        if (privilegesToGrant.length > 0) {
          const grantStatement = `GRANT ${privilegesToGrant.join(", ")} ON "${schemaName}"."${tableName}" TO "${roleName}";`;
          sqlStatements.push(grantStatement);
        }

        // Determine privileges to revoke
        const privilegesToRevoke = oldRolePrivileges.filter(
          (privilege) => !newRolePrivileges.includes(privilege)
        );
        if (privilegesToRevoke.length > 0) {
          const revokeStatement = `REVOKE ${privilegesToRevoke.join(", ")} ON "${schemaName}"."${tableName}" FROM "${roleName}";`;
          sqlStatements.push(revokeStatement);
        }
      }

      // Check for roles to remove
      for (const roleName in oldPrivilegesTables) {
        if (!newPrivilegesTables[roleName]) {
          const revokeStatement = `REVOKE ALL ON "${schemaName}"."${tableName}" FROM "${roleName}";`;
          sqlStatements.push(revokeStatement);
        }
      }
    }

    console.debug("SQL Statements:", sqlStatements);

    return sqlStatements;
  }
}
