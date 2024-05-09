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