export const privileges = {
  postgres: {
    SELECT: ["PlaylistId", "Name"],
    INSERT: ["Name"],
    UPDATE: ["PlaylistId", "Name"],
    REFERENCES: ["PlaylistId", "Name"],
  },
};

export const meta = {
  table_schema: "private_tables",
  table_name: "Playlist",
  database: "totuna",
};
