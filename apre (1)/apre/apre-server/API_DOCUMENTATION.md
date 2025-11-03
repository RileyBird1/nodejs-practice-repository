# APRE API Documentation (Additions)

## New Endpoint: Sales by Product and Customer

**URL:** `/reports/sales/sales-by-product-customer`  
**Method:** `GET`  
**Description:** Returns aggregated sales totals grouped by product and customer. Supports optional filtering by date range, product, and customer.

Query Parameters:
- `startDate` (optional): ISO date string, e.g. `2023-01-01`
- `endDate` (optional): ISO date string
- `product` (optional): product name/string
- `customer` (optional): customer name/string

Example Request:
GET /reports/sales/sales-by-product-customer?startDate=2023-01-01&endDate=2023-01-31

Success Response (200 OK):
```json
[
  {
    "product": "string",
    "customer": "string",
    "totalSales": 123.45,
    "salesCount": 3
  }
]
```

Possible Errors:
- 400 Bad Request - invalid date formats
- 500 Internal Server Error

Notes:
- Endpoint implemented in `src/routes/reports/sales/index.js`
- Aggregation uses the `sales` collection and groups on the `product` and `customer` fields.
