import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Invoice"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Invoice",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "TRUNCATE",
          "DELETE",
          "UPDATE",
          "INSERT",
          "SELECT",
          "TRIGGER",
          "REFERENCES"
        ]
      }
    ]
  }
} satisfies TablePrivileges;