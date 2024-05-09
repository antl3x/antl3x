import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js"
  
  export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "PlaylistTrack"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "UPDATE",
        "TRIGGER",
        "REFERENCES",
        "TRUNCATE",
        "DELETE",
        "SELECT",
        "INSERT"
      ]
    }
  ]
} satisfies TablePrivileges;