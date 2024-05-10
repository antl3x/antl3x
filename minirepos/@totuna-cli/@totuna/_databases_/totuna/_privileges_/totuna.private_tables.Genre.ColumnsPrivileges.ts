import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Genre"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Genre",
    privileges: [
      {
        column: "GenreId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "Name",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;