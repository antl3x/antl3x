import fs from "node:fs";
import { z } from "zod";
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

const DiffPolicy = z.object({
  localState: z.union([z.literal("Present"), z.literal("Absent")]),
  remoteState: z.union([z.literal("Present"), z.literal("Absent"), z.literal("Outdated")]),
  plan: z.union([z.literal("Create Policy"), z.literal("Delete Policy"), z.literal("Update Policy")]),
  planQuery: z.string(),
  targetTable: z.string(),
  policyName: z.string().nullable(),
  onCommand: z.string().nullable(),
  applyTo: z.array(z.string()),
});

const DiffTable = z.object({
  localState: z.union([z.literal("RLS Enabled"), z.literal("RLS Disabled")]),
  remoteState: z.union([z.literal("RLS Enabled"), z.literal("RLS Disabled")]),
  plan: z.union([z.literal("Enable RLS"), z.literal("Disable RLS")]),
  planQuery: z.string(),
  targetTable: z.string(),
});

const Diff = z.union([DiffPolicy, DiffTable]);

export const checkDiff = async () => {
  const remoteTableFiles = (await pullRemoteTableFiles()).map((res) => res.fileContent);
  const localTableFiles = await _getLocalTableFiles();
  const diffs: z.TypeOf<typeof Diff>[] = [];

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

  // Generate query for each table state
  for (const tableState of tableStateDiff.additions) {
    diffs.push(
      DiffTable.parse({
        localState: "RLS Enabled",
        remoteState: "RLS Disabled",
        plan: "Enable RLS",
        planQuery: `ALTER TABLE ${tableState.schema}."${tableState.table}" ENABLE ROW LEVEL SECURITY`,
        targetTable: `${tableState.schema}.${tableState.table}`,
      }),
    );
  }

  for (const tableState of tableStateDiff.removals) {
    const isUpdate = tableStateDiff.additions.some((table) => table.schema === tableState.schema && table.table === tableState.table);
    if (isUpdate) {
      continue;
    }

    diffs.push(
      DiffTable.parse({
        localState: "RLS Disabled",
        remoteState: "RLS Enabled",
        plan: "Disable RLS",
        planQuery: `ALTER TABLE ${tableState.schema}."${tableState.table}" DISABLE ROW LEVEL SECURITY`,
        targetTable: `${tableState.schema}.${tableState.table}`,
      }),
    );
  }

  for (const policyState of policyStateDiff.additions) {
    const isUpdate = policyStateDiff.removals.some(
      (policy) => policy.name === policyState.name && policy.schema === policyState.schema && policy.table === policyState.table,
    );
    const createPolicyQuery = `CREATE POLICY "${policyState.name}" ON ${policyState.schema}."${policyState.table}" FOR ${policyState.for} TO ${policyState.to.map((role) => `"${role}"`).join(", ")} ${policyState.as} ${policyState.exprUsing ? `USING (${policyState.exprUsing})` : ""} ${policyState.exprWithCheck ? `WITH CHECK (${policyState.exprWithCheck})` : ""}`;
    const dropPolicyQuery = `DROP POLICY "${policyState.name}" ON ${policyState.schema}."${policyState.table}"`;
    const planQuery = isUpdate ? `${dropPolicyQuery}; ${createPolicyQuery};` : createPolicyQuery;

    diffs.push(
      DiffPolicy.parse({
        localState: "Present",
        remoteState: isUpdate ? "Outdated" : "Absent",
        plan: isUpdate ? "Update Policy" : "Create Policy",
        planQuery,
        targetTable: `${policyState.schema}.${policyState.table}`,
        policyName: policyState.name,
        onCommand: policyState.for,
        applyTo: policyState.to,
      }),
    );
  }

  for (const policyState of policyStateDiff.removals) {
    const isUpdate = policyStateDiff.additions.some(
      (policy) => policy.name === policyState.name && policy.schema === policyState.schema && policy.table === policyState.table,
    );
    if (isUpdate) {
      continue;
    }

    const dropPolicyQuery = `DROP POLICY "${policyState.name}" ON ${policyState.schema}."${policyState.table}"`;
    diffs.push(
      DiffPolicy.parse({
        localState: "Absent",
        remoteState: "Present",
        plan: "Delete Policy",
        planQuery: dropPolicyQuery,
        targetTable: `${policyState.schema}.${policyState.table}`,
        policyName: policyState.name,
        onCommand: policyState.for,
        applyTo: policyState.to,
      }),
    );
  }

  return diffs;
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
c.relrowsecurity AS "rlsEnabled",  -- directly retrieving RLS enabled status
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
AND n.nspname != 'information_schema';
`;
