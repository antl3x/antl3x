export default {
  kind: 'TablePrivileges',
  metadata: {
    database: 'totuna',
    schema: 'private_tables',
    table: 'Genre',
  },
  spec: [
    {
      role: 'postgres',
      privileges: ['TRIGGER', 'REFERENCES', 'TRUNCATE', 'DELETE', 'UPDATE', 'INSERT', 'SELECT'],
    },
  ],
}
