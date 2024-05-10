import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.PlaylistTrack"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "PlaylistTrack",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "TRUNCATE",
          "TRIGGER",
          "REFERENCES",
          "DELETE",
          "UPDATE",
          "SELECT",
          "INSERT"
        ]
      }
    ]
  }
} satisfies TablePrivileges;