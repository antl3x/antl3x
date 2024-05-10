import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.MediaType"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "MediaType",
    privileges: [
      {
        column: "MediaTypeId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES",
              "SELECT",
              "INSERT",
              "UPDATE"
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
              "UPDATE",
              "SELECT",
              "INSERT",
              "REFERENCES"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;