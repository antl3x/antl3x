export const privileges = {
  "postgres": {
    "PlaylistId": [
      "REFERENCES",
      "UPDATE",
      "INSERT",
      "SELECT"
    ],
    "Name": [
      "INSERT",
      "REFERENCES",
      "UPDATE",
      "SELECT"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Playlist",
  "table_catalog": "totuna"
};