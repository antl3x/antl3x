import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "InvoiceLine"
  },
  spec: [
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
} satisfies TablePrivileges;