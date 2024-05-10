import type { FunctionPrivileges } from "@totuna/cli/@CRDs/@CRD_FunctionPrivileges.js"
  
  export default {
  kind: "FunctionPrivileges",
  metadata: {
    name: "totuna.public_views.customers(n integer)"
  },
  spec: {
    database: "totuna",
    schema: "public_views",
    function: "customers(n integer)",
    privileges: [
      {
        role: "PUBLIC",
        privileges: [
          "EXECUTE"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "EXECUTE"
        ]
      }
    ]
  }
} satisfies FunctionPrivileges;