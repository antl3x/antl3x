export const privileges = {
  "postgres": {
    "TrackId": [
      "UPDATE",
      "INSERT",
      "REFERENCES",
      "SELECT"
    ],
    "UnitPrice": [
      "REFERENCES",
      "SELECT",
      "INSERT",
      "UPDATE"
    ],
    "InvoiceId": [
      "REFERENCES",
      "INSERT",
      "UPDATE",
      "SELECT"
    ],
    "Quantity": [
      "UPDATE",
      "INSERT",
      "REFERENCES",
      "SELECT"
    ],
    "InvoiceLineId": [
      "SELECT",
      "UPDATE",
      "INSERT",
      "REFERENCES"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "InvoiceLine",
  "table_catalog": "totuna"
};