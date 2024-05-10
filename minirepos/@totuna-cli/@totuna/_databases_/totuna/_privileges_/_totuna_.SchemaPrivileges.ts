import type { SchemaPrivileges } from "@totuna/cli/@CRDs/@CRD_SchemaPrivileges.js"
  
  export default {
  kind: "SchemaPrivileges",
  metadata: {
    name: "_totuna_"
  },
  spec: {
    database: "totuna",
    schema: "_totuna_",
    privileges: [
      {
        role: "PUBLIC",
        privileges: [
          "CREATE",
          "USAGE"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "USAGE",
          "CREATE"
        ]
      }
    ]
  }
} satisfies SchemaPrivileges;