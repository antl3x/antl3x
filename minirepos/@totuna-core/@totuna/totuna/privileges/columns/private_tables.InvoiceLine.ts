export const privileges = {
  otherrole: {
    SELECT: ["InvoiceLineId", "InvoiceId", "Quantity", "TrackId", "UnitPrice"],
  },
  postgres: {
    SELECT: ["InvoiceLineId", "InvoiceId", "Quantity", "TrackId", "UnitPrice"],
    INSERT: ["InvoiceLineId", "InvoiceId", "Quantity", "TrackId", "UnitPrice"],
    UPDATE: ["InvoiceLineId", "InvoiceId", "Quantity", "TrackId", "UnitPrice"],
    REFERENCES: ["InvoiceLineId", "InvoiceId", "Quantity", "TrackId", "UnitPrice"],
  },
};

export const meta = {
  table_schema: "private_tables",
  table_name: "InvoiceLine",
  database: "totuna",
};
