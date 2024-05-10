import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Artist"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Artist",
    privileges: [
      {
        role: "customer:xyz",
        privileges: [
          "SELECT"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "TRIGGER",
          "REFERENCES",
          "TRUNCATE",
          "DELETE",
          "UPDATE",
          "INSERT",
          "SELECT"
        ]
      }
    ]
  }
} satisfies TablePrivileges;