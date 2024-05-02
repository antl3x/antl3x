export const privileges = {
  "postgres": {
    "SELECT": [
      "id",
      "name",
      "hash",
      "executed_at"
    ],
    "INSERT": [
      "id",
      "name",
      "hash",
      "executed_at"
    ],
    "UPDATE": [
      "id",
      "name",
      "hash",
      "executed_at"
    ],
    "REFERENCES": [
      "id",
      "name",
      "hash",
      "executed_at"
    ]
  }
};

export const meta = {
  "table_schema": "_totuna_",
  "table_name": "migrations",
  "database": "totuna"
};