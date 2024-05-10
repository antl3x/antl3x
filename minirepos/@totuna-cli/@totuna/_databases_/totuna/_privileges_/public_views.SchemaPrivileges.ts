import type { SchemaPrivileges } from "@totuna/cli/@CRDs/@CRD_SchemaPrivileges.js"
  
  export default {
  kind: "SchemaPrivileges",
  metadata: {
    name: "public_views"
  },
  spec: {
    database: "totuna",
    schema: "public_views",
    privileges: [
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