import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Customer"
  },
  spec: [
    {
      role: "PUBLIC",
      privileges: [
        "TRIGGER",
        "UPDATE",
        "DELETE",
        "TRUNCATE",
        "SELECT",
        "REFERENCES",
        "INSERT"
      ]
    },
    {
      role: "postgres",
      privileges: [
        "INSERT",
        "REFERENCES",
        "TRIGGER",
        "TRUNCATE",
        "DELETE",
        "UPDATE",
        "SELECT"
      ]
    }
  ]
} satisfies TablePrivileges;