import type { SchemaPrivileges } from "@totuna/cli/@CRDs/@CRD_SchemaPrivileges.js"
  
  export default {
  kind: "SchemaPrivileges",
  metadata: {
    name: "private_tables"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    privileges: [
      {
        role: "PUBLIC",
        privileges: [
          "USAGE",
          "CREATE"
        ]
      },
      {
        role: "customer:xyz",
        privileges: [
          "USAGE"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "CREATE",
          "USAGE"
        ]
      }
    ]
  }
} satisfies SchemaPrivileges;