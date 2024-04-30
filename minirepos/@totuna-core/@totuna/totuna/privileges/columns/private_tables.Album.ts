export const privileges = {
  "postgres": {
    "SELECT": [
      "AlbumId",
      "Title",
      "ArtistId"
    ],
    "INSERT": [
      "AlbumId",
      "Title",
      "ArtistId"
    ],
    "UPDATE": [
      "AlbumId",
      "Title",
      "ArtistId"
    ],
    "REFERENCES": [
      "AlbumId",
      "Title",
      "ArtistId"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Album",
  "database": "totuna"
};