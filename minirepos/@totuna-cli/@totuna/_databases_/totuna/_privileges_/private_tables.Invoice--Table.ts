export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Invoice"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "INSERT",
        "TRIGGER",
        "REFERENCES",
        "TRUNCATE",
        "DELETE",
        "UPDATE",
        "SELECT"
      ]
    }
  ]
}