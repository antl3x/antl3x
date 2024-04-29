export const privileges = {
  "postgres": {
    "MediaTypeId": [
      "REFERENCES",
      "SELECT",
      "INSERT",
      "UPDATE"
    ],
    "Name": [
      "SELECT",
      "UPDATE",
      "INSERT",
      "REFERENCES"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "MediaType",
  "table_catalog": "totuna"
};