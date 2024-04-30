export const privileges = {
  "postgres": {
    "SELECT": [
      "TrackId",
      "PlaylistId"
    ],
    "INSERT": [
      "TrackId",
      "PlaylistId"
    ],
    "UPDATE": [
      "TrackId",
      "PlaylistId"
    ],
    "REFERENCES": [
      "TrackId",
      "PlaylistId"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "PlaylistTrack",
  "database": "totuna"
};