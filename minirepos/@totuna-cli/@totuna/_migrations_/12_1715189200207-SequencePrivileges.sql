-- Migration generated by @TOTUNA CLI
-- Generated at: 2024-05-08T17:26:40.201Z

REVOKE SELECT ON SEQUENCE private_tables."seq" FROM "authenticated";
REVOKE UPDATE ON SEQUENCE private_tables."seq" FROM "authenticated";
REVOKE USAGE ON SEQUENCE private_tables."seq" FROM "authenticated";