# Mock API Documentation

This document lists the API actions that are currently using mock data or simulated responses. These mocks are in place because the corresponding endpoints in the KRA USSD Service Postman collection are either missing or do not support the required functionality.

## 1. eTIMS (`app/actions/etims.ts`)

### `submitPartialCreditNote` (Fallback)
*   **Status**: Partial Mock logic.
*   **Reason**: The Postman collection's `Submit Credit Note` request does not support the full payload (items, reason, return quantity) required for a partial credit note.
*   **Implementation**: Tries to call `POST /api/ussd/submit/credit-note` with the full payload. If the server returns a 400/422 error (indicating schema mismatch), it falls back to returning a mock success response to allow the UI flow to complete for demonstration.

## 2. Tax Filing (`app/actions/tax-filing.ts`)

The following actions are entirely or partially mocked because no matching endpoints exist in the provided `KRA USSD Service.postman_collection.json`.

### `getTaxpayerObligations`
*   **Status**: Fully Mocked.
*   **Reason**: No endpoint available to fetch a taxpayer's registered obligations (VAT, MRI, TOT, etc.).
*   **Implementation**: Returns a hardcoded object with all obligations set to `true`.

### `getFilingPeriods`
*   **Status**: Mocked on Error.
*   **Reason**: The endpoint `POST /api/ussd/obligation-filling-period` is called, but if it fails (likely due to environment or missing implementation on backend), it returns a generated list of periods for the current month.
*   **Implementation**: Calculates current and previous month dates dynamically.

### `fileNilReturn`
*   **Status**: Mocked on Error/Missing.
*   **Reason**: `POST /api/ussd/file-return` is called. If the endpoint is 404 or fails, it returns a mock success response.
*   **Implementation**: Returns a success status and a generated `NIL-{Timestamp}` receipt number.

### `fileMriReturn` (Monthly Rental Income)
*   **Status**: Mocked on Error/Missing.
*   **Reason**: `POST /api/ussd/file-return` is called (with `returnType: 'mri_return'`). If it fails, returns mock success.
*   **Implementation**: Returns a generated `MRI-{Timestamp}` receipt number.

### `fileTotReturn` (Turnover Tax)
*   **Status**: Mocked on Error/Missing.
*   **Reason**: `POST /api/ussd/file-return` is called (with `returnType: 'tot_return'`). If it fails, returns mock success.
*   **Implementation**: Returns a generated `TOT-{Timestamp}` receipt number.

### `sendWhatsAppNotification`
*   **Status**: Fully Mocked.
*   **Reason**: No endpoint available for sending WhatsApp notifications is defined in the collection.
*   **Implementation**: Logs the request to the console and returns `success: true`.

### `lookupTaxpayerById`
*   **Status**: Real with Mock Fallback.
*   **Reason**: Primary API `https://kratest.pesaflow.com/api/itax/gui-lookup` works. A secondary fallback to `https://etims.1automations.com/buyer_lookup` exists.
*   **Implementation**: Only returns mock data if the ID number is exactly `'12345678'` and both real APIs fail. Otherwise, it relies on the real APIs.
