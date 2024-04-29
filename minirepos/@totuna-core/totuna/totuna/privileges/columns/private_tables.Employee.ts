export const privileges = {
  "postgres": {
    "Phone": [
      "INSERT",
      "SELECT",
      "REFERENCES",
      "UPDATE"
    ],
    "HireDate": [
      "INSERT",
      "SELECT",
      "REFERENCES",
      "UPDATE"
    ],
    "LastName": [
      "REFERENCES",
      "UPDATE",
      "INSERT",
      "SELECT"
    ],
    "EmployeeId": [
      "REFERENCES",
      "INSERT",
      "SELECT",
      "UPDATE"
    ],
    "PostalCode": [
      "SELECT",
      "INSERT",
      "UPDATE",
      "REFERENCES"
    ],
    "Title": [
      "UPDATE",
      "SELECT",
      "REFERENCES",
      "INSERT"
    ],
    "BirthDate": [
      "SELECT",
      "REFERENCES",
      "INSERT",
      "UPDATE"
    ],
    "Email": [
      "REFERENCES",
      "UPDATE",
      "SELECT",
      "INSERT"
    ],
    "Fax": [
      "SELECT",
      "UPDATE",
      "REFERENCES",
      "INSERT"
    ],
    "Address": [
      "SELECT",
      "REFERENCES",
      "INSERT",
      "UPDATE"
    ],
    "City": [
      "UPDATE",
      "SELECT",
      "REFERENCES",
      "INSERT"
    ],
    "State": [
      "UPDATE",
      "SELECT",
      "REFERENCES",
      "INSERT"
    ],
    "FirstName": [
      "UPDATE",
      "REFERENCES",
      "INSERT",
      "SELECT"
    ],
    "ReportsTo": [
      "SELECT",
      "INSERT",
      "REFERENCES",
      "UPDATE"
    ],
    "Country": [
      "REFERENCES",
      "INSERT",
      "SELECT",
      "UPDATE"
    ]
  }
};

export const meta = {
  "table_schema": "private_tables",
  "table_name": "Employee",
  "table_catalog": "totuna"
};