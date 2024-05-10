import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Track"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Track",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "SELECT",
          "UPDATE",
          "DELETE",
          "INSERT",
          "TRUNCATE",
          "REFERENCES",
          "TRIGGER"
        ]
      }
    ]
  }
} satisfies TablePrivileges;