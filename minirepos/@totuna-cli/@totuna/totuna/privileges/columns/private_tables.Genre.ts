export const privileges = {
  "postgres": {
    "SELECT": [
      "GenreId",
      "Name"
    ],
    "INSERT": [
      "GenreId",
      "Name"
    ],
    "UPDATE": [
      "GenreId",
      "Name"
    ],
    "REFERENCES": [
      "GenreId",
      "Name"
    ]
  },
  "customer:xyz": {
    "SELECT": [
      "GenreId",
      "Name"
    ],
    "INSERT": [
      "GenreId",
      "Name"
    ],
    "UPDATE": [
      "GenreId",
      "Name"
    ]
  },
  "group:customer": {
    "SELECT": [
      "GenreId",
      "Name"
    ],
    "INSERT": [
      "GenreId",
      "Name"
    ],
    "UPDATE": [
      "GenreId",
      "Name"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Genre",
  "database": "totuna"
};