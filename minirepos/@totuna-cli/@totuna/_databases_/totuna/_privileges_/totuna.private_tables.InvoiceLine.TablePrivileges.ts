import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.InvoiceLine"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "InvoiceLine",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "TRIGGER",
          "INSERT",
          "SELECT",
          "UPDATE",
          "DELETE",
          "TRUNCATE",
          "REFERENCES"
        ]
      }
    ]
  }
} satisfies TablePrivileges;