export default {
  kind: 'TablePrivileges',
  metadata: {
    database: 'totuna',
    schema: 'private_tables',
    table: 'Album',
  },
  spec: [
    {
      role: 'postgres',
      privileges: ['SELECT', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'UPDATE', 'INSERT'],
    },
  ],
}
