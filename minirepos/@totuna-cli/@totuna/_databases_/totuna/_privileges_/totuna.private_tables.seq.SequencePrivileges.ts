import type { SequencePrivileges } from "@totuna/cli/@CRDs/@CRD_SequencePrivileges.js"
  
  export default {
  kind: "SequencePrivileges",
  metadata: {
    name: "totuna.private_tables.seq"
  },
  spec: {
    database: "totuna",
    schema: "private_tables",
    sequence: "seq",
    privileges: [
      {
        role: "PUBLIC",
        privileges: [
          "USAGE",
          "SELECT",
          "UPDATE"
        ]
      },
      {
        role: "authenticated",
        privileges: [
          "UPDATE",
          "SELECT",
          "USAGE"
        ]
      },
      {
        role: "postgres",
        privileges: [
          "SELECT",
          "USAGE",
          "UPDATE"
        ]
      }
    ]
  }
} satisfies SequencePrivileges;