
export default {
  kind: 'TablePrivileges',
  metadata: {
    database: 'totuna',
    schema: '_totuna_',
    table: 'migrations',
  },
  spec: [
    {
      role: 'PUBLIC',
      privileges: ['SELECT'],
    },
    {
      role: 'postgres',
      privileges: ['REFERENCES', 'TRUNCATE', 'DELETE', 'TRIGGER', 'SELECT', 'INSERT', 'UPDATE'],
    },
  ],
}
