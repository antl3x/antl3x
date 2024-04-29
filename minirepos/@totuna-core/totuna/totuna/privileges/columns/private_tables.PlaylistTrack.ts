export const privileges = {
  "postgres": {
    "TrackId": [
      "REFERENCES",
      "INSERT",
      "SELECT",
      "UPDATE"
    ],
    "PlaylistId": [
      "UPDATE",
      "INSERT",
      "REFERENCES",
      "SELECT"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "PlaylistTrack",
  "table_catalog": "totuna"
};