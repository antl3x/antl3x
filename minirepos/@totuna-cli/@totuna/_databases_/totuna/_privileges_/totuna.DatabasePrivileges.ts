import type { DatabasePrivileges } from "@totuna/cli/@CRDs/@CRD_DatabasePrivileges.js"
  
  export default {
  kind: "DatabasePrivileges",
  metadata: {
    name: "totuna"
  },
  spec: {
    database: "totuna",
    privileges: [
      {
        role: "postgres",
        privileges: [
          "CREATE",
          "TEMPORARY",
          "CONNECT"
        ]
      }
    ]
  }
} satisfies DatabasePrivileges;