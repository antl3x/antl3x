export const privileges = {
  "postgres": {
    "SELECT": [
      "Composer",
      "AlbumId",
      "Bytes",
      "TrackId",
      "Milliseconds",
      "MediaTypeId",
      "GenreId",
      "Name",
      "UnitPrice"
    ],
    "INSERT": [
      "Composer",
      "AlbumId",
      "Bytes",
      "TrackId",
      "Milliseconds",
      "MediaTypeId",
      "GenreId",
      "Name",
      "UnitPrice"
    ],
    "UPDATE": [
      "Composer",
      "AlbumId",
      "Bytes",
      "TrackId",
      "Milliseconds",
      "MediaTypeId",
      "GenreId",
      "Name",
      "UnitPrice"
    ],
    "REFERENCES": [
      "Composer",
      "AlbumId",
      "Bytes",
      "TrackId",
      "Milliseconds",
      "MediaTypeId",
      "GenreId",
      "Name",
      "UnitPrice"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Track",
  "database": "totuna"
};