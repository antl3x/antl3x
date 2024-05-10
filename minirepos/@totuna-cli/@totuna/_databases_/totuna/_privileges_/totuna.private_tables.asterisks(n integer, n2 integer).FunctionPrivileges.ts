import type { FunctionPrivileges } from "@totuna/cli/@CRDs/@CRD_FunctionPrivileges.js"
  
  export default {
  kind: "FunctionPrivileges",
  metadata: {
    name: "totuna.private_tables.asterisks(n integer, n2 integer)"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    function: "asterisks(n integer, n2 integer)",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "EXECUTE"
        ]
      }
    ]
  }
} satisfies FunctionPrivileges;