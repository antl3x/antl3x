import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Track"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "SELECT",
        "UPDATE",
        "DELETE",
        "TRUNCATE",
        "REFERENCES",
        "INSERT",
        "TRIGGER"
      ]
    }
  ]
} satisfies TablePrivileges;