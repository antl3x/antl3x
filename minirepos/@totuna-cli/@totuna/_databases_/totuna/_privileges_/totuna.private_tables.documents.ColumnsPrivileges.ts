import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.documents"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "documents",
    privileges: [
      {
        column: "data",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "REFERENCES",
              "UPDATE",
              "INSERT"
            ]
          }
        ]
      },
      {
        column: "id",
        privileges: [
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