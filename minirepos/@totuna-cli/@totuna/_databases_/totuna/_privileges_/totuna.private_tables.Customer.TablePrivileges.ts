import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Customer"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Customer",
    privileges: [
      {
        role: "PUBLIC",
        privileges: [
          "TRIGGER",
          "SELECT",
          "INSERT",
          "UPDATE",
          "DELETE",
          "TRUNCATE",
          "REFERENCES"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "SELECT",
          "UPDATE",
          "DELETE",
          "TRUNCATE",
          "REFERENCES",
          "TRIGGER",
          "INSERT"
        ]
      }
    ]
  }
} satisfies TablePrivileges;