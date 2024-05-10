import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Artist"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Artist",
    privileges: [
      {
        column: "ArtistId",
        privileges: [
          {
            role: "customer:xyz",
            privileges: [
              "SELECT"
            ]
          },
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
        column: "Name",
        privileges: [
          {
            role: "customer:xyz",
            privileges: [
              "SELECT"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "UPDATE",
              "INSERT",
              "REFERENCES",
              "SELECT"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;