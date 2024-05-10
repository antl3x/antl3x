import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Album"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Album",
    privileges: [
      {
        role: "PUBLIC",
        privileges: []
      }
    ]
  }
} satisfies TablePrivileges;