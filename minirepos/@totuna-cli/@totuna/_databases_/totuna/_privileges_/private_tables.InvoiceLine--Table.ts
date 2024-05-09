export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "InvoiceLine"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "SELECT",
        "TRIGGER",
        "REFERENCES",
        "TRUNCATE",
        "DELETE",
        "UPDATE",
        "INSERT"
      ]
    }
  ]
}