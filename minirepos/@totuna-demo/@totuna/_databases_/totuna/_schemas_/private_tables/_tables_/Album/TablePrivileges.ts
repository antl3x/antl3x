import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Album"
  },
  spec: [
    {
      role: "PUBLIC",
      privileges: []
    }
  ]
} satisfies TablePrivileges;