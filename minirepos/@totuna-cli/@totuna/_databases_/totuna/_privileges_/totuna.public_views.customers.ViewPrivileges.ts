import type { ViewPrivileges } from "@totuna/cli/@CRDs/@CRD_ViewPrivileges.js"
  
  export default {
  kind: "ViewPrivileges",
  metadata: {
    name: "totuna.public_views.customers"
  },
  spec: {
    database: "totuna",
    schema: "public_views",
    view: "customers",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "INSERT",
          "SELECT",
          "UPDATE",
          "DELETE",
          "TRUNCATE",
          "REFERENCES",
          "TRIGGER"
        ]
      }
    ]
  }
} satisfies ViewPrivileges;