export const privileges = {
  "postgres": {
    "GenreId": [
      "REFERENCES",
      "INSERT",
      "UPDATE",
      "SELECT"
    ],
    "Name": [
      "INSERT",
      "SELECT",
      "REFERENCES",
      "UPDATE"
    ]
  },
  "group:customer": {
    "GenreId": [
      "INSERT",
      "UPDATE",
      "SELECT"
    ],
    "Name": [
      "INSERT",
      "UPDATE",
      "SELECT"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Genre",
  "table_catalog": "totuna"
};