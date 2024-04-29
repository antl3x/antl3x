export const privileges = {
  "postgres": {
    "SupportRepId": [
      "REFERENCES",
      "UPDATE",
      "INSERT",
      "SELECT"
    ],
    "Email": [
      "UPDATE",
      "SELECT",
      "INSERT",
      "REFERENCES"
    ],
    "Country": [
      "SELECT",
      "INSERT",
      "UPDATE",
      "REFERENCES"
    ],
    "FirstName": [
      "SELECT",
      "UPDATE",
      "INSERT",
      "REFERENCES"
    ],
    "Phone": [
      "REFERENCES",
      "UPDATE",
      "INSERT",
      "SELECT"
    ],
    "Fax": [
      "INSERT",
      "UPDATE",
      "REFERENCES",
      "SELECT"
    ],
    "PostalCode": [
      "REFERENCES",
      "SELECT",
      "UPDATE",
      "INSERT"
    ],
    "CustomerId": [
      "UPDATE",
      "SELECT",
      "INSERT",
      "REFERENCES"
    ],
    "Address": [
      "UPDATE",
      "SELECT",
      "INSERT",
      "REFERENCES"
    ],
    "Company": [
      "INSERT",
      "UPDATE",
      "REFERENCES",
      "SELECT"
    ],
    "State": [
      "REFERENCES",
      "SELECT",
      "UPDATE",
      "INSERT"
    ],
    "City": [
      "INSERT",
      "SELECT",
      "REFERENCES",
      "UPDATE"
    ],
    "LastName": [
      "REFERENCES",
      "INSERT",
      "UPDATE",
      "SELECT"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Customer",
  "table_catalog": "totuna"
};