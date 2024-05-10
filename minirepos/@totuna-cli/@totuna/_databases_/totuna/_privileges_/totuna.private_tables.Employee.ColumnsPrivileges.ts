import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna.private_tables.Employee"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    table: "Employee",
    privileges: [
      {
        column: "Address",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES",
              "SELECT",
              "UPDATE",
              "INSERT"
            ]
          }
        ]
      },
      {
        column: "BirthDate",
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
        column: "City",
        privileges: [
          {
            role: "postgres",
            privileges: [
              "REFERENCES",
              "SELECT",
              "UPDATE",
              "INSERT"
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
              "REFERENCES",
              "SELECT",
              "INSERT",
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
              "UPDATE",
              "REFERENCES",
              "SELECT",
              "INSERT"
            ]
          }
        ]
      },
      {
        column: "EmployeeId",
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
        column: "Fax",
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
        column: "FirstName",
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
        column: "HireDate",
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
              "REFERENCES",
              "INSERT"
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
              "SELECT",
              "INSERT",
              "UPDATE",
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "ReportsTo",
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
              "SELECT",
              "INSERT",
              "UPDATE"
            ]
          }
        ]
      },
      {
        column: "Title",
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
      }
    ]
  }
} satisfies ColumnsPrivileges;