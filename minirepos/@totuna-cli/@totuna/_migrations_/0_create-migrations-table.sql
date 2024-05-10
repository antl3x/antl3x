
  CREATE SCHEMA IF NOT EXISTS "_totuna_";

  REVOKE ALL ON SCHEMA _totuna_ FROM PUBLIC;
  REVOKE CREATE ON SCHEMA _totuna_ FROM PUBLIC;
  REVOKE USAGE ON SCHEMA _totuna_ FROM PUBLIC;

  CREATE TABLE IF NOT EXISTS "_totuna_".migrations (
    id integer PRIMARY KEY,
    name varchar(100) UNIQUE NOT NULL,
    hash varchar(40) NOT NULL, -- sha1 hex encoded hash of the file name and contents, to ensure it hasn't been altered since applying the migration
    content text NOT NULL,
    executed_at timestamp DEFAULT current_timestamp
  );