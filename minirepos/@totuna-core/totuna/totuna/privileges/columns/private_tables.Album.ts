export const privileges = {
  "postgres": {
    "AlbumId": [
      "INSERT",
      "UPDATE",
      "SELECT",
      "REFERENCES"
    ],
    "Title": [
      "REFERENCES",
      "UPDATE",
      "INSERT",
      "SELECT"
    ],
    "ArtistId": [
      "INSERT",
      "REFERENCES",
      "UPDATE",
      "SELECT"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Album",
  "table_catalog": "totuna"
};