export const privileges = {
  "postgres": {
    "Composer": [
      "UPDATE",
      "INSERT",
      "SELECT",
      "REFERENCES"
    ],
    "AlbumId": [
      "UPDATE",
      "SELECT",
      "REFERENCES",
      "INSERT"
    ],
    "Bytes": [
      "UPDATE",
      "INSERT",
      "SELECT",
      "REFERENCES"
    ],
    "TrackId": [
      "REFERENCES",
      "UPDATE",
      "INSERT",
      "SELECT"
    ],
    "MediaTypeId": [
      "REFERENCES",
      "INSERT",
      "UPDATE",
      "SELECT"
    ],
    "GenreId": [
      "REFERENCES",
      "INSERT",
      "UPDATE",
      "SELECT"
    ],
    "Name": [
      "INSERT",
      "REFERENCES",
      "SELECT",
      "UPDATE"
    ],
    "UnitPrice": [
      "SELECT",
      "REFERENCES",
      "INSERT",
      "UPDATE"
    ],
    "Milliseconds": [
      "UPDATE",
      "SELECT",
      "INSERT",
      "REFERENCES"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Track",
  "table_catalog": "totuna"
};