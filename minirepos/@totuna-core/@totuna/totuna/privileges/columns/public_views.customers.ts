export const privileges = {
  "postgres": {
    "SELECT": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ],
    "INSERT": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ],
    "UPDATE": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ],
    "REFERENCES": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ]
  },
  "customer:xyz": {
    "SELECT": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ],
    "UPDATE": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ]
  },
  "group:customer": {
    "SELECT": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ],
    "UPDATE": [
      "CustomerId",
      "FirstName",
      "LastName",
      "Company",
      "Address",
      "City",
      "State",
      "Country",
      "PostalCode",
      "Phone",
      "Fax",
      "Email",
      "SupportRepId"
    ]
  }
};

export const meta = {
  "table_schema": "public_views",
  "table_name": "customers",
  "database": "totuna"
};