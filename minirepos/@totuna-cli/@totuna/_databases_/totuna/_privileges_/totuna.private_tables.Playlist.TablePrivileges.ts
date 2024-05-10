import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    name: "totuna.private_tables.Playlist"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Playlist",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "TRIGGER",
          "REFERENCES",
          "TRUNCATE",
          "DELETE",
          "UPDATE",
          "SELECT",
          "INSERT"
        ]
      }
    ]
  }
} satisfies TablePrivileges;