import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna._totuna_.migrations"
  },
  spec: {
    database: "totuna",
    schema: "_totuna_",
    table: "migrations",
    privileges: [
      {
        role: "PUBLIC",
        privileges: [
          "SELECT"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "DELETE",
          "TRUNCATE",
          "REFERENCES",
          "TRIGGER",
          "UPDATE",
          "SELECT",
          "INSERT"
        ]
      }
    ]
  }
} satisfies TablePrivileges;