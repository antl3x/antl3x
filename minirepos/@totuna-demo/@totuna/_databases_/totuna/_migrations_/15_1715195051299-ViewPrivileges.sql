-- Migration generated by @TOTUNA CLI
-- Generated at: 2024-05-08T19:04:11.285Z

REVOKE SELECT ON TABLE public_views."customers" FROM "group:customer";
REVOKE UPDATE ON TABLE public_views."customers" FROM "group:customer";