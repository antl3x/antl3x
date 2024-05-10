import type { ColumnsPrivileges } from "@totuna/cli/@CRDs/@CRD_ColumnsPrivileges.js"
  
  export default {
  kind: "ColumnsPrivileges",
  metadata: {
    name: "totuna._totuna_.migrations"
  },
  spec: {
    database: "totuna",
    schema: "_totuna_",
    table: "migrations",
    privileges: [
      {
        column: "content",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "INSERT",
              "UPDATE",
              "SELECT",
              "REFERENCES"
            ]
          }
        ]
      },
      {
        column: "executed_at",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT"
            ]
          },
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
        column: "hash",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT"
            ]
          },
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
        column: "id",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT"
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
          },
          {
            role: "testes",
            privileges: [
              "SELECT"
            ]
          }
        ]
      },
      {
        column: "name",
        privileges: [
          {
            role: "PUBLIC",
            privileges: [
              "SELECT"
            ]
          },
          {
            role: "postgres",
            privileges: [
              "SELECT",
              "REFERENCES",
              "UPDATE",
              "INSERT"
            ]
          },
          {
            role: "testes",
            privileges: [
              "SELECT"
            ]
          }
        ]
      }
    ]
  }
} satisfies ColumnsPrivileges;