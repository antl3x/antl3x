import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Genre"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Genre",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "REFERENCES",
          "TRUNCATE",
          "TRIGGER"
        ]
      }
    ]
  }
} satisfies TablePrivileges;