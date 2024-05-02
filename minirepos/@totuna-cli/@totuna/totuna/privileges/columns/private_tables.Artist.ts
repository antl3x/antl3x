export const privileges = {
  "postgres": {
    "SELECT": [
      "Name",
      "ArtistId"
    ],
    "INSERT": [
      "Name",
      "ArtistId"
    ],
    "UPDATE": [
      "Name",
      "ArtistId"
    ],
    "REFERENCES": [
      "Name",
      "ArtistId"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Artist",
  "database": "totuna"
};