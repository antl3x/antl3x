import fs from "node:fs";
import path from "node:path";
import { stringify, parseAllDocuments } from "yaml";
import { format } from "sql-formatter";

import { getRootStore } from "@rootStore.js";
import { PolicyState, TableFile, TableState } from "./@misc.js";
import { diffArr } from "_utils_/_@utils_.js";

export type PullRemoteTableFilesRes = {
  fileName: string;
  fileContent: TableFile;
  status: "written" | "skipped-diff" | "skipped";
};

export const checkDiff = async () => {
  const remoteTableFiles = (await pullRemoteTableFiles()).map((res) => res.fileContent);
  const localTableFiles = await _getLocalTableFiles();

  // Group states to compare
  const remotePoliciesStates: PolicyState[] = [];
  const remoteTableStates: TableState[] = [];
  const localPoliciesStates: PolicyState[] = [];
  const localTableStates: TableState[] = [];

  for (const tableFile of remoteTableFiles) {
    remoteTableStates.push(TableState.parse({ ...tableFile._meta_, rlsEnabled: tableFile.rlsEnabled }));
    for (const policy of tableFile.policies) {
      remotePoliciesStates.push(PolicyState.parse({ ...policy, schema: tableFile._meta_.schema, table: tableFile._meta_.table }));
    }
  }

  for (const tableFile of localTableFiles) {
    localTableStates.push(TableState.parse({ ...tableFile._meta_, rlsEnabled: tableFile.rlsEnabled }));
    for (const policy of tableFile.policies) {
      localPoliciesStates.push(PolicyState.parse({ ...policy, schema: tableFile._meta_.schema, table: tableFile._meta_.table }));
    }
  }

  // Compare states
  const tableStateDiff = diffArr(remoteTableStates, localTableStates);
  const policyStateDiff = diffArr(remotePoliciesStates, localPoliciesStates);

  const rawQueries = new Map<string, string>();

  // Generate query for each table state
  for (const tableState of tableStateDiff.additions) {
    rawQueries.set(
      `alterTable:${tableState.schema}.${tableState.table}`,
      `ALTER TABLE ${tableState.schema}."${tableState.table}" ${tableState.rlsEnabled ? "ENABLE" : "DISABLED"} ROW LEVEL SECURITY`,
    );
  }

  for (const policyState of policyStateDiff.removals) {
    rawQueries.set(
      `dropPolicy:${policyState.schema}.${policyState.table}.${policyState.name}`,
      `DROP POLICY "${policyState.name}" ON ${policyState.schema}."${policyState.table}"`,
    );
  }

  for (const policyState of policyStateDiff.additions) {
    rawQueries.set(
      `createPolicy:${policyState.schema}.${policyState.table}.${policyState.name}`,
      `CREATE POLICY "${policyState.name}" ON ${policyState.schema}."${policyState.table}" FOR ${policyState.for} TO ${policyState.to.join(", ")} AS ${policyState.as} ${policyState.exprUsing ? `USING (${policyState.exprUsing})` : ""} ${policyState.exprWithCheck ? `WITH CHECK (${policyState.exprWithCheck})` : ""}`,
    );
  }

  return { tableStateDiff, policyStateDiff, rawQueries };
};

const _getLocalTableFiles = async (): Promise<TableFile[]> => {
  const { systemVariables } = await getRootStore();
  const files = fs.readdirSync(systemVariables.PUBLIC_STATE_RLS_PATH);
  const tableFiles = [];

  for (const file of files) {
    if (!file.endsWith(".yaml")) continue;
    const filePath = path.resolve(systemVariables.PUBLIC_STATE_RLS_PATH, file);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const tableFile = await _parseYAMLtoTableFile(fileContents, filePath);
    tableFiles.push(tableFile);
  }

  return tableFiles;
};

export const pullRemoteTableFiles = async (): Promise<PullRemoteTableFilesRes[]> => {
  const { pgClient, systemVariables } = await getRootStore();

  if (!fs.existsSync(systemVariables.PUBLIC_STATE_RLS_PATH)) {
    fs.mkdirSync(systemVariables.PUBLIC_STATE_RLS_PATH, { recursive: true });
  }

  const { rows } = await pgClient.query<PolicyState & { rlsEnabled: boolean }>(SQL_QUERY);

  const tableFiles = [];
  const results: PullRemoteTableFilesRes[] = [];

  for (const row of rows) {
    let policies: Omit<PolicyState, "schema" | "table">[] = [];
    let existingIndex = -1;
    for (let i = 0; i < tableFiles.length; i++) {
      if (tableFiles[i]._meta_.schema === row.schema && tableFiles[i]._meta_.table === row.table) {
        existingIndex = i;
        break;
      }
    }

    if (row.name) {
      const policyState = PolicyState.parse({
        ...row,
        to: (row.to as unknown) == "{}" ? ["public"] : (row.to as unknown as string).replace(/{|}/g, "").split(","),
      });
      const policyStateFormated = {
        ...policyState,
        exprUsing: row.exprUsing ? format(row.exprUsing, { language: "postgresql" }) : null,
        exprWithCheck: row.exprWithCheck ? format(row.exprWithCheck, { language: "postgresql" }) : null,
        to: (row.to as unknown) == "{}" ? ["public"] : (row.to as unknown as string).replace(/{|}/g, "").split(","),
      };
      policies = existingIndex !== -1 ? [...tableFiles[existingIndex].policies, policyStateFormated] : [policyStateFormated];
    }

    const tableFile = TableFile.parse({
      _meta_: { schema: row.schema, table: row.table },
      rlsEnabled: row.rlsEnabled,
      policies,
    });

    if (existingIndex !== -1) {
      tableFiles[existingIndex].policies = tableFile.policies;
    } else {
      tableFiles.push(tableFile);
    }
  }

  for (const tableFile of tableFiles) {
    const fileName = `${tableFile._meta_.schema}.${tableFile._meta_.table}.yaml`;
    const filePath = path.resolve(systemVariables.PUBLIC_STATE_RLS_PATH, fileName);
    if (fs.existsSync(filePath)) {
      results.push({ fileName, fileContent: tableFile, status: "skipped" });
      continue;
    }

    const content = _parseTableFileToYAML(tableFile);
    fs.writeFileSync(filePath, content);
    results.push({ fileName, fileContent: tableFile, status: "written" });
  }

  return results;
};

const _parseTableFileToYAML = (tableFile: TableFile): string => {
  let content = stringify({ ...tableFile, _meta_: undefined }, { indent: 2 });
  content = content.replace(/(rlsEnabled|\s\s- name):/gim, "\n$1:");
  content = content.replace(/(policies):\n\n/gim, "\n$1:\n");
  return `---\nschema: ${tableFile._meta_.schema}\ntable: ${tableFile._meta_.table}\n---\n${content}`;
};

/**
 * Parses a YAML file into a TableFile object.
 * @param fileContents The contents of the YAML file.
 * @returns A TableFile object.
 */
export const _parseYAMLtoTableFile = async (fileContents: string, filePath: string): Promise<TableFile> => {
  try {
    const [metadata, content] = parseAllDocuments(fileContents);

    return TableFile.parse({
      _meta_: metadata.contents!.toJSON(),
      ...content.contents!.toJSON(),
    });
  } catch (error) {
    throw new Error(`Failed to parse the YAML file. ${filePath} / ${error}`, { cause: error });
  }
};

const SQL_QUERY = `SELECT n.nspname AS schema,
c.relname AS table,
CASE 
    WHEN pol.polname IS NOT NULL THEN true 
    ELSE false 
END AS "rlsEnabled",
pol.polname AS name,
CASE 
    WHEN pol.polpermissive THEN 'PERMISSIVE'::text
    ELSE 'RESTRICTIVE'::text
END AS as,
CASE
    WHEN pol.polroles = '{0}'::oid[] THEN string_to_array('public'::text, ''::text)::name[]
    ELSE ARRAY( SELECT pg_authid.rolname
        FROM pg_authid
      WHERE pg_authid.oid = ANY (pol.polroles)
      ORDER BY pg_authid.rolname)
END AS to,
CASE pol.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
    ELSE NULL
END AS for,
pg_get_expr(pol.polqual, pol.polrelid) AS "exprUsing",
pg_get_expr(pol.polwithcheck, pol.polrelid) AS "exprWithCheck"
FROM pg_class c
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policy pol ON c.oid = pol.polrelid
WHERE c.relkind = 'r'
AND n.nspname NOT LIKE 'pg_%'
AND n.nspname != 'information_schema';`;
