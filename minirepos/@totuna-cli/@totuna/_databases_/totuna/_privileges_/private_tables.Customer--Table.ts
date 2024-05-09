export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Customer"
  },
  spec: [
    {
      role: "PUBLIC",
      privileges: [
        "TRIGGER",
        "TRUNCATE",
        "DELETE",
        "UPDATE",
        "SELECT",
        "INSERT",
        "REFERENCES"
      ]
    },
    {
      role: "postgres",
      privileges: [
        "SELECT",
        "UPDATE",
        "DELETE",
        "TRUNCATE",
        "REFERENCES",
        "TRIGGER",
        "INSERT"
      ]
    }
  ]
}