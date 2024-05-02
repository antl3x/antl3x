export const privileges = {
  "postgres": {
    "SELECT": [
      "MediaTypeId",
      "Name"
    ],
    "INSERT": [
      "MediaTypeId",
      "Name"
    ],
    "UPDATE": [
      "MediaTypeId",
      "Name"
    ],
    "REFERENCES": [
      "MediaTypeId",
      "Name"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "MediaType",
  "database": "totuna"
};