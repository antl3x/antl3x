export const privileges = {
  "postgres": {
    "SELECT": [
      "Total",
      "BillingAddress",
      "BillingPostalCode",
      "InvoiceDate",
      "BillingCity",
      "BillingCountry",
      "CustomerId",
      "InvoiceId",
      "BillingState"
    ],
    "INSERT": [
      "Total",
      "BillingAddress",
      "BillingPostalCode",
      "InvoiceDate",
      "BillingCity",
      "BillingCountry",
      "CustomerId",
      "InvoiceId",
      "BillingState"
    ],
    "UPDATE": [
      "Total",
      "BillingAddress",
      "BillingPostalCode",
      "InvoiceDate",
      "BillingCity",
      "BillingCountry",
      "CustomerId",
      "InvoiceId",
      "BillingState"
    ],
    "REFERENCES": [
      "Total",
      "BillingAddress",
      "BillingPostalCode",
      "InvoiceDate",
      "BillingCity",
      "BillingCountry",
      "CustomerId",
      "InvoiceId",
      "BillingState"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Invoice",
  "database": "totuna"
};