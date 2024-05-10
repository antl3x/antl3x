import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Playlist"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Playlist",
    privileges: [
      {
        column: "Name",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "INSERT",
              "SELECT",
              "UPDATE",
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "PlaylistId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "UPDATE",
              "SELECT",
              "REFERENCES",
              "INSERT"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;