# eTIMS API Endpoints - cURL Reference

Base URL: `https://kratest.pesaflow.com/api/ussd`

---

## 1. Taxpayer Validation

### Service Initialization
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/init" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "msisdn": "254712345678"
  }'
```

### ID Lookup
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/id-lookup" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "id_number": "12345678"
  }'
```

### Register Taxpayer for USSD
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/register-tax-payer" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "id_number": "12345678",
    "msisdn": "254712345678"
  }'
```

### Buyer/Seller Lookup (by PIN or ID)
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/buyer-initiated/lookup" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "pin_or_id": "A012345678Z"
  }'
```

---

## 2. Sales Invoice

### Create Sale Invoice
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/post-sale" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "msisdn": "254712345678",
    "total_amount": 1000,
    "items": [
      {
        "item_name": "Product Name",
        "taxable_amount": 100,
        "quantity": 10
      }
    ]
  }'
```

---

## 3. Credit Note

### Search Invoice for Credit Note
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/search/credit-note" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "msisdn": "254712345678",
    "invoice_no": "1004"
  }'
```

### Submit Credit Note (Full)
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/submit/credit-note" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "msisdn": "254712345678",
    "invoice_no": "1004"
  }'
```

---

## 4. Buyer-Initiated Invoice

### Fetch Pending Invoices
```bash
curl -X GET "https://kratest.pesaflow.com/api/ussd/buyer-initiated/fetch/254712345678" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd"
```

### Create Buyer-Initiated Invoice
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/buyer-initiated/submit/invoice" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "seller_pin": "A001159936V",
    "seller_msisdn": "254718471455",
    "msisdn": "254712345678",
    "total_amount": 1000,
    "items": [
      {
        "item_name": "Product Name",
        "taxable_amount": 100,
        "quantity": 10
      }
    ]
  }'
```

### Accept Invoice
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/buyer-initiated/action/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "action": "accept",
    "msisdn": "254712345678",
    "invoice": "BI-KWFQOH; KES 1000; SELLER NAME"
  }'
```

### Reject Invoice
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/buyer-initiated/action/submit" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "action": "reject",
    "msisdn": "254712345678",
    "invoice": "BI-KWFQOH; KES 1000; SELLER NAME"
  }'
```

---

## 5. PIN Registration

### Register PIN (Citizen)
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/pin-registration" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "type": "citizen",
    "email": "your_email@example.com",
    "msisdn": "254712345678",
    "id_number": "12345678"
  }'
```

### Register PIN (Resident)
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/pin-registration" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "type": "resident",
    "email": "your_email@example.com",
    "msisdn": "254712345678",
    "id_number": "123456789"
  }'
```

---

## 6. Tax Filing

### File NIL Return
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/file-return" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "kra_obligation_id": "8",
    "returnPeriod": "01/09/2024 - 30/09/2024",
    "returnType": "nil_return",
    "tax_payer_pin": "A005456284F"
  }'
```

### Fetch Filing Period
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/obligation-filling-period" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "branch_id": "",
    "from_date": "",
    "from_itms_or_prtl": "PRTL",
    "is_amended": "N",
    "obligation_id": "8",
    "pin": "A005456284F"
  }'
```

---

## 7. Payments

### Get Taxpayer Liabilities
```bash
curl -X GET "https://kratest.pesaflow.com/api/ussd/tax-payer-liabilities?obligation_id=8&tax_payer_pin=A003032441Y" \
  -H "x-forwarded-for: triple_2_ussd"
```

### Generate PRN
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/generate-prn" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "tax_payer_pin": "A003032441Y",
    "obligation_id": "8",
    "tax_period_from": "01-06-2025",
    "tax_period_to": "30-06-2025",
    "amount": "1000"
  }'
```

### Make Payment
```bash
curl -X POST "https://kratest.pesaflow.com/api/ussd/make-payment" \
  -H "Content-Type: application/json" \
  -H "x-forwarded-for: triple_2_ussd" \
  -d '{
    "msisdn": "254712345678",
    "prn": "PRN123456"
  }'
```

---

## 8. Verification Services

### PIN Checker
```bash
curl -X GET "https://kratest.pesaflow.com/api/taxpayer/pin-checker?pin_number=A012345678Z" \
  -H "x-forwarded-for: triple_2_ussd"
```

### GUI Lookup (Primary - Recommended)
```bash
curl -X GET "https://kratest.pesaflow.com/api/itax/gui-lookup?gui=37998670&tax_payer_type=KE" \
  -H "x-source-for: whatsapp"
```

---

## Response Codes Reference

| Code | Message |
|------|---------|
| 0 | Tax Payer not registered |
| 1 | Tax Payer registered |
| 3 | Valid ID Number |
| 4 | Invalid ID Number / PIN Number is Invalid |
| 5 | Registration Successful |
| 8 | Etims Invoice Created Successfully |
| 10 | Unable to Create Etims Invoice |
| 11 | Unable to Create Etims Credit Note |
| 13 | Invalid Invoice Number |
| 14 | Valid Invoice Number |
| 17 | Buyer Initiated Invoice Created Successfully |
| 19 | No Invoices Found |

---

## API Status (Tested 2025-12-15)

| Endpoint | Status |
|----------|--------|
| `/buyer-initiated/lookup` | ✅ Working |
| `/post-sale` | ✅ Working |
| `/buyer-initiated/fetch/{msisdn}` | ✅ Working |
| `/search/credit-note` | ✅ Working |
| `/submit/credit-note` | ✅ Working |
| `/buyer-initiated/submit/invoice` | ✅ Working |
| `/buyer-initiated/action/submit` | ❌ 500 Error |
