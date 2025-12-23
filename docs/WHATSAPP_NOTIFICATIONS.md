# WhatsApp Notifications Documentation

This document outlines the locations in the application where WhatsApp notifications are triggered, grouped by their respective routes. Each notification request should be a `GET` request with parameters included in the URL to minimize webhook configurations on the WhatsApp side.

## 1. Compliance (F88)

These notifications relate to the Passenger Declarations module.

**Route Base:** `/app/f88`

### Notification Events

1.  **Declaration Submitted (Finalize)**
    *   **Trigger:** When a user successfully completes the declaration wizard and clicks "Finish" or "Pay".
    *   **Location:** `app/actions/customs.ts` -> `finalizeDeclaration` (or called from `app/f88/page.tsx`).
    *   **Purpose:** Send the generated F88 form PDF and payment instructions/receipt.
    *   **Parameters:**
        *   `type`: `f88_declaration`
        *   `ref_no`: The declaration reference number (e.g., `KRA...`).
        *   `phone`: The provided MSISDN.
        *   `status`: `submitted` | `paid`.
        *   `amount`: Payment amount (if applicable).

---

## 2. eTIMS (Electronic Tax Invoice Management)

These notifications relate to Sales Invoices, Credit Notes, and Buyer-Initiated Invoice approvals.

**Route Base:** `/app/etims`

### Notification Events

1.  **Sales Invoice Created**
    *   **Trigger:** When a seller successfully submits a sales invoice.
    *   **Location:** `app/etims/sales-invoice/success/page.tsx`
    *   **Purpose:** Send the generated Invoice PDF to the seller (and optionally the buyer).
    *   **Parameters:**
        *   `type`: `etims_invoice`
        *   `invoice_no`: The generated invoice number.
        *   `phone`: The logged-in user's MSISDN using the system.
        *   `buyer_phone`: (Optional) The buyer's MSISDN.
        *   `amount`: Total invoice amount.
        *   `date`: Date of issuance.

2.  **Credit Note Created**
    *   **Trigger:** When a credit note is successfully submitted.
    *   **Location:** `app/etims/credit-note/success/page.tsx`
    *   **Purpose:** Send the Credit Note PDF.
    *   **Parameters:**
        *   `type`: `etims_credit_note`
        *   `credit_note_id`: The generated credit note ID.
        *   `invoice_ref`: The original invoice reference.
        *   `phone`: The logged-in user's MSISDN.
        *   `amount`: Credited amount.

3.  **Buyer-Initiated Invoice (Seller Created)**
    *   **Trigger:** When a seller creates a pending invoice for a buyer to approve.
    *   **Location:** `app/etims/buyer-initiated/seller/success/page.tsx`
    *   **Purpose:** Notify the buyer that they have an invoice waiting for approval.
    *   **Parameters:**
        *   `type`: `etims_buyer_pending`
        *   `invoice_ref`: The reference number.
        *   `seller_name`: Name of the seller.
        *   `buyer_phone`: The buyer's MSISDN (recipient).
        *   `amount`: Invoice amount.
        *   `action_link`: Link to open the approval page.

4.  **Buyer-Initiated Invoice (Buyer Action)**
    *   **Trigger:** When a buyer Accepts or Rejects an invoice.
    *   **Location:** `app/etims/buyer-initiated/buyer/view/page.tsx` (redirects to success page).
    *   **Purpose:** Notify the seller of the buyer's decision (Accept/Reject).
    *   **Parameters:**
        *   `type`: `etims_buyer_action`
        *   `invoice_ref`: The reference number.
        *   `action`: `accepted` | `rejected`.
        *   `seller_phone`: The seller's MSISDN (if available) or system notification.
        *   `buyer_phone`: The buyer's phone (for confirmation receipt).

---

## 3. Tax Filing (NIL, MRI, TOT)

These notifications relate to result messages after filing returns.

**Route Base:** `/app/nil-mri-tot`

### Notification Events

1.  **NIL Return Filed**
    *   **Trigger:** Successful submission of a NIL return.
    *   **Location:** `app/nil-mri-tot/_components/nil/NilResult.tsx`
    *   **Purpose:** Send filing text confirmation (or receipt).
    *   **Parameters:**
        *   `type`: `tax_return_nil`
        *   `krapin`: The taxpayer's PIN.
        *   `obligation`: `income_tax_resident` | `tot` | `mri` etc.
        *   `period`: The tax period filed for.
        *   `phone`: The user's MSISDN.
        *   `ref_number`: The KRA acknowledgement number.

2.  **MRI Return Filed (Monthly Rental Income)**
    *   **Trigger:** Successful submission of MRI return (with or without payment).
    *   **Location:** `app/nil-mri-tot/_components/mri/MriResult.tsx`
    *   **Purpose:** Send filing receipt and payment confirmation.
    *   **Parameters:**
        *   `type`: `tax_return_mri`
        *   `krapin`: The taxpayer's PIN.
        *   `amount_tax`: Tax amount due/paid.
        *   `payment_status`: `paid` | `pending`.
        *   `property_count`: Number of properties declared (optional).
        *   `phone`: The user's MSISDN.
        *   `ref_number`: The KRA acknowledgement number.

3.  **TOT Return Filed (Turnover Tax)**
    *   **Trigger:** Successful submission of TOT return.
    *   **Location:** `app/nil-mri-tot/_components/tot/TotResult.tsx`
    *   **Purpose:** Send filing receipt and payment confirmation.
    *   **Parameters:**
        *   `type`: `tax_return_tot`
        *   `krapin`: The taxpayer's PIN.
        *   `mode`: `daily` | `monthly`.
        *   `amount_sales`: Gross sales declared.
        *   `amount_tax`: Tax amount.
        *   `payment_status`: `paid` | `pending`.
        *   `phone`: The user's MSISDN.
        *   `ref_number`: The KRA acknowledgement number.

---

## Summary of URL Structure

To standardize, all requests can target a common base webhook (per app) or a single router with the `type` parameter determining the processing logic.

**Proposed Query Parameters for GET Request:**

`?type=[TYPE]&phone=[PHONE]&ref=[REF]&status=[STATUS]`

Where `[TYPE]` is one of:
*   `f88_declaration`
*   `etims_invoice`
*   `etims_credit_note`
*   `etims_buyer_pending`
*   `etims_buyer_action`
*   `tax_return_nil`
*   `tax_return_mri`
*   `tax_return_tot`
