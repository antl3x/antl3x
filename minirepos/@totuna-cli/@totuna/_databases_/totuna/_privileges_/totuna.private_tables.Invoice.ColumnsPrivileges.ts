import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Invoice"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Invoice",
    privileges: [
      {
        column: "BillingAddress",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "INSERT",
              "SELECT",
              "REFERENCES",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "BillingCity",
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
        column: "BillingCountry",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "UPDATE",
              "INSERT",
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "BillingPostalCode",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES",
              "UPDATE",
              "SELECT",
              "INSERT"
            ]
          }
        ]
      },
      {
        column: "BillingState",
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
        column: "CustomerId",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "UPDATE",
              "REFERENCES",
              "INSERT"
            ]
          }
        ]
      },
      {
        column: "InvoiceDate",
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
        column: "InvoiceId",
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
        column: "Total",
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