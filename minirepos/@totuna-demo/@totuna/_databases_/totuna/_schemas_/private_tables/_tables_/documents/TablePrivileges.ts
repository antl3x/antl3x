import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "documents"
  },
  spec: [
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
} satisfies TablePrivileges;