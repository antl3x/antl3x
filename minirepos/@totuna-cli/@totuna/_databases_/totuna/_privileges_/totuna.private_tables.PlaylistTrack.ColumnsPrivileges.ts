import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.PlaylistTrack"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "PlaylistTrack",
    privileges: [
      {
        column: "PlaylistId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "INSERT",
              "REFERENCES",
              "SELECT",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "TrackId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "INSERT",
              "REFERENCES",
              "SELECT",
              "UPDATE"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;