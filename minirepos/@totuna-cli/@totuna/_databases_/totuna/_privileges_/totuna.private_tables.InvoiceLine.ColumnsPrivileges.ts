import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.InvoiceLine"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "InvoiceLine",
    privileges: [
      {
        column: "InvoiceId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES",
              "INSERT",
              "SELECT",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "InvoiceLineId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "INSERT",
              "REFERENCES",
              "UPDATE",
              "SELECT"
            ]
          }
        ]
      },
      {
        column: "Quantity",
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
        column: "TrackId",
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
      },
      {
        column: "UnitPrice",
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