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
    "UPDATE"
  ],
  "group:customer": [
    "SELECT",
    "UPDATE"
  ]
};

export const meta = {
  "schema": "public_views",
  "view": "customers",
  "database": "totuna"
};