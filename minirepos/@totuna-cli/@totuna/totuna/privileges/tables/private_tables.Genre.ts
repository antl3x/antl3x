export const privileges = {
  "postgres": [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "TRUNCATE",
    "REFERENCES",
    "TRIGGER"
  ],
  "customer:xyz": [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE"
  ],
  "group:customer": [
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE"
  ]
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Genre",
  "database": "totuna"
};