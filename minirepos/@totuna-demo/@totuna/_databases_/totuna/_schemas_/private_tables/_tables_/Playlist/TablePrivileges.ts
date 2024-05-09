import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Playlist"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "UPDATE",
        "INSERT",
        "SELECT",
        "TRIGGER",
        "REFERENCES",
        "TRUNCATE",
        "DELETE"
      ]
    }
  ]
} satisfies TablePrivileges;