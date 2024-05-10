import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Album"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Album",
    privileges: [
      {
        column: "AlbumId",
        privileges: [
          {
            role: "authenticated",
            privileges: [
              "SELECT"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;