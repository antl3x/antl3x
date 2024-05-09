import type { TablePrivileges } from "@totuna/cli/@CRDs/@CRD_TablePrivileges.js";

export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Artist",
  },
  spec: [
    {
      role: "customer:xyz",
      privileges: ["SELECT"],
    },
    {
      role: "postgres",
      privileges: [
        "TRIGGER",
        "REFERENCES",
        "TRUNCATE",
        "DELETE",
        "UPDATE",
        "INSERT",
        "SELECT",
      ],
    },
  ],
} satisfies TablePrivileges;
