export default {
  kind: "TablePrivileges",
  metadata: {
    database: "totuna",
    schema: "private_tables",
    table: "Playlist"
  },
  spec: [
    {
      role: "postgres",
      privileges: [
        "TRIGGER",
        "REFERENCES",
        "TRUNCATE",
        "DELETE",
        "UPDATE",
        "SELECT",
        "INSERT"
      ]
    }
  ]
}