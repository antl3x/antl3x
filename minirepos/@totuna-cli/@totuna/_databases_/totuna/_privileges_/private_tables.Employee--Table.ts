export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Employee"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "DELETE",
        "INSERT",
        "SELECT",
        "UPDATE",
        "TRUNCATE",
        "REFERENCES",
        "TRIGGER"
      ]
    }
  ]
}