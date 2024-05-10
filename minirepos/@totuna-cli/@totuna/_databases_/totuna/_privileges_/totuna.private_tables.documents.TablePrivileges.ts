import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.documents"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "documents",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "REFERENCES",
          "INSERT",
          "SELECT",
          "UPDATE",
          "DELETE",
          "TRUNCATE",
          "TRIGGER"
        ]
      }
    ]
  }
} satisfies TablePrivileges;