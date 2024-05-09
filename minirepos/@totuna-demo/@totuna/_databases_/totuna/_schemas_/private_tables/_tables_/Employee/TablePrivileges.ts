import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Employee"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "TRIGGER",
        "DELETE",
        "TRUNCATE",
        "REFERENCES",
        "INSERT",
        "SELECT",
        "UPDATE"
      ]
    }
  ]
} satisfies TablePrivileges;