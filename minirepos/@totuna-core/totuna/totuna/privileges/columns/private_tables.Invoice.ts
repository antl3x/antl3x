export const privileges = {
  "postgres": {
    "CustomerId": [
      "UPDATE",
      "INSERT",
      "SELECT",
      "REFERENCES"
    ],
    "BillingCountry": [
      "INSERT",
      "REFERENCES",
      "UPDATE",
      "SELECT"
    ],
    "InvoiceId": [
      "UPDATE",
      "REFERENCES",
      "INSERT",
      "SELECT"
    ],
    "Total": [
      "SELECT",
      "UPDATE",
      "REFERENCES",
      "INSERT"
    ],
    "BillingAddress": [
      "SELECT",
      "REFERENCES",
      "UPDATE",
      "INSERT"
    ],
    "BillingPostalCode": [
      "INSERT",
      "UPDATE",
      "SELECT",
      "REFERENCES"
    ],
    "InvoiceDate": [
      "INSERT",
      "REFERENCES",
      "SELECT",
      "UPDATE"
    ],
    "BillingCity": [
      "SELECT",
      "UPDATE",
      "INSERT",
      "REFERENCES"
    ],
    "BillingState": [
      "INSERT",
      "UPDATE",
      "REFERENCES",
      "SELECT"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Invoice",
  "table_catalog": "totuna"
};