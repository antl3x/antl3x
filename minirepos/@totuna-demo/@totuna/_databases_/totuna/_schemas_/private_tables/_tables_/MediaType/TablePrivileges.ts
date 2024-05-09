import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "MediaType"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "INSERT",
        "SELECT",
        "UPDATE",
        "DELETE",
        "TRUNCATE",
        "REFERENCES",
        "TRIGGER"
      ]
    }
  ]
} satisfies TablePrivileges;