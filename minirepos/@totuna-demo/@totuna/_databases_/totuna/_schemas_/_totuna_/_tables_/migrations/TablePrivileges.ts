import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "_totuna_",
    table: "migrations"
  },
  spec: [
    {
      role: "PUBLIC",
      privileges: [
        "SELECT"
      ]
    },
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