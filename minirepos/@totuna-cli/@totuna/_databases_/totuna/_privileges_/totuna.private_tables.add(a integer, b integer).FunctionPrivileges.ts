import type { FunctionPrivileges } from "@totuna/cli/@CRDs/@CRD_FunctionPrivileges.js"
  
  export default {
  kind: "FunctionPrivileges",
  metadata: {
    name: "totuna.private_tables.add(a integer, b integer)"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    function: "add(a integer, b integer)",
    privileges: [
      {
        role: "authenticated",
        privileges: [
          "EXECUTE"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "EXECUTE"
        ]
      }
    ]
  }
} satisfies FunctionPrivileges;