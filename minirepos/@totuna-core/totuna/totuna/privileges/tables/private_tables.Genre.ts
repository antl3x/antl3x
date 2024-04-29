export const privileges = {
  "postgres": [
    "INSERT",
    "SELECT",
    "UPDATE",
    "DELETE",
    "TRUNCATE",
    "REFERENCES",
    "TRIGGER"
  ],
  "group:customer": [
    "INSERT",
    "SELECT",
    "UPDATE",
    "DELETE"
  ]
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Genre",
  "table_catalog": "totuna"
};