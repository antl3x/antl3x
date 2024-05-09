export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Artist"
  },
  spec: [
    {
      role: "customer:xyz",
      privileges: [
        "SELECT"
      ]
    },
    {
      role: "postgres",
      privileges: [
        "TRUNCATE",
        "UPDATE",
        "TRIGGER",
        "INSERT",
        "SELECT",
        "DELETE",
        "REFERENCES"
      ]
    }
  ]
}