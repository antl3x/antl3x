import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.public_views.customers"
  },
  spec: {
    database: "totuna",
    schema: "public_views",
    table: "customers",
    privileges: [
      {
        column: "Address",
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
      },
      {
        column: "City",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "INSERT",
              "UPDATE",
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "Company",
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
        column: "Country",
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
      },
      {
        column: "CustomerId",
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
        column: "Email",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES",
              "INSERT",
              "UPDATE",
              "SELECT"
            ]
          }
        ]
      },
      {
        column: "Fax",
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
        column: "FirstName",
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
        column: "LastName",
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
        column: "Phone",
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
        column: "PostalCode",
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
        column: "State",
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
        column: "SupportRepId",
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