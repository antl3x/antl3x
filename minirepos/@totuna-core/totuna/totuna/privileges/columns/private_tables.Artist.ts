export const privileges = {
  "postgres": {
    "Name": [
      "REFERENCES",
      "INSERT",
      "SELECT",
      "UPDATE"
    ],
    "ArtistId": [
      "SELECT",
      "UPDATE",
      "INSERT",
      "REFERENCES"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Artist",
  "table_catalog": "totuna"
};