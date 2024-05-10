import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Customer"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Customer",
    privileges: [
      {
        column: "Address",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT",
              "UPDATE",
              "INSERT",
              "REFERENCES"
            ]
          },
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
        column: "City",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "UPDATE",
              "SELECT",
              "INSERT",
              "REFERENCES"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "REFERENCES",
              "INSERT",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "Company",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "INSERT",
              "SELECT",
              "REFERENCES",
              "UPDATE"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "REFERENCES",
              "INSERT",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "Country",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "INSERT",
              "SELECT",
              "REFERENCES",
              "UPDATE"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "REFERENCES",
              "INSERT",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "CustomerId",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "INSERT",
              "SELECT",
              "UPDATE",
              "REFERENCES"
            ]
          },
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
        column: "Email",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "INSERT",
              "SELECT",
              "UPDATE",
              "REFERENCES"
            ]
          },
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
        column: "Fax",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "UPDATE",
              "REFERENCES",
              "INSERT",
              "SELECT"
            ]
          },
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
      },
      {
        column: "FirstName",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "INSERT",
              "UPDATE",
              "SELECT",
              "REFERENCES"
            ]
          },
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
        column: "LastName",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "INSERT",
              "SELECT",
              "UPDATE",
              "REFERENCES"
            ]
          },
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
        column: "Phone",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "UPDATE",
              "REFERENCES",
              "INSERT",
              "SELECT"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "UPDATE",
              "REFERENCES",
              "SELECT",
              "INSERT"
            ]
          }
        ]
      },
      {
        column: "PostalCode",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT",
              "UPDATE",
              "INSERT",
              "REFERENCES"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "UPDATE",
              "INSERT",
              "SELECT",
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "State",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "UPDATE",
              "REFERENCES",
              "INSERT",
              "SELECT"
            ]
          },
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
        column: "SupportRepId",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "UPDATE",
              "SELECT",
              "REFERENCES",
              "INSERT"
            ]
          },
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
      }
    ]
  }
} satisfies ColumnsPrivileges;