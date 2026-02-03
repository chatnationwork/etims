# eTIMS Technical Documentation

## 1. System Architecture & Context
The eTIMS module is a **Next.js 14 App Router** application designed to function as a **WhatsApp Web View**. This context drives many architectural decisions, particularly around session handling and entry points.

*   **Deep Linking**: Users rarely land on "Home" first. They usually enter via a parameterized URL.
    *   *Login*: `app/etims/auth/login/page.tsx` reads `searchParams` (`?phone=...`) to pre-fill the form.
    *   *Buyer Actions*: `app/etims/buyer-initiated/buyer/create/page.tsx` may receive `?sku=...` or other context.

*   **Server Actions**: All business logic (API calls to KRA) resides in `app/actions/etims.ts`. This ensures:
    *   **Secret Protection**: API Keys/Tokens never touch the client.
    *   **Token Injection**: The `getAuthHeaders()` helper reads the HTTP-only `etims_auth_token` cookie and injects it into every request.

---

## 2. Module Breakdown

### 2.1 Dashboard (`app/etims/page.tsx`)
*   **Role**: Router and State Cleaner.
*   **Logic**:
    *   When clicking a card (e.g., "Sales Invoice"), it calls a cleanup function (e.g., `clearSalesInvoice()` from `_lib/store.ts`) to ensure no stale state persists derived from `sessionStorage`.
    *   Navigates to the first step of the respective flow (e.g., `/etims/sales-invoice/buyer`).

### 2.2 Sales Invoice Module (`app/etims/sales-invoice/`)
**Flow**: `buyer` -> `details` -> `review` -> `success`

*   **Step 1: Buyer (`buyer/page.tsx`)**:
    *   **Component**: `SalesInvoiceBuyer`.
    *   **State**: `useState` for name/pin.
    *   **Validation Check**: 
        *   If PIN is provided: calls `lookupCustomer(pin)` (Server Action).
        *   If PIN is empty: Allows "Name Only" proceed (logic modified in Task 32).
    *   **Persistence**: Saves validated data to `sessionStorage` key `etims_sales_invoice`.

*   **Step 2: Details (`details/page.tsx`)**:
    *   **Component**: `SalesInvoiceDetails`.
    *   **Logic**: Manages list of items (`InvoiceItem[]`).
    *   **Calculation**: Helper `calculateTotals` computes subtotal/tax client-side for display.

*   **Step 3: Submit (`review/page.tsx`)**:
    *   **Action**: `submitInvoice` (Server Action).
    *   **Payload**: Maps `sessionStorage` item list to API format.
        *   `customer_pin`: sent as `undefined` or empty string if Name Only flow.
    *   **PDF Handling**: Returns `invoice_pdf_url`.
    *   **Notification**: Calls `sendInvoiceCreditDocTemplate` to trigger WhatsApp API.

### 2.3 Credit Note Module (`app/etims/credit-note/`)
**Flow**: `search` -> `full` OR `partial-select` -> `review`

*   **Step 1: Search (`search/page.tsx`)**:
    *   **Action**: `searchCreditNoteInvoice(invoiceNumber)`.
    *   **Validation**: 
        *   Checks `result.hasCreditNote` (Boolean).
        *   **Rule**: If `hasCreditNote` is true, user restricted to **Full** CN only (Partial blocked).
    *   **Routing**:
        *   If `type === 'full'`: Redirect to `full/page.tsx`.
        *   If `type === 'partial'`: Redirect to `partial-select/page.tsx`.

*   **Step 2: Partial Select (`partial-select/page.tsx`)**:
    *   **Logic**: Displays original items.
    *   **Validation**: `new_quantity <= original_quantity`. System prevents returning more than bought.

### 2.4 Buyer Initiated Module (`app/etims/buyer-initiated/`)
**Context**: Reverses the flow. Buyer creates -> Seller approves.

*   **Buyer Create (`buyer/create/page.tsx`)**:
    *   **Validation**: `transactionType` toggle switches regex validation for the Seller PIN input.
    *   **Server Action**: `lookupCustomer` verifies the **Seller** exists before proceeding.

*   **Seller Pending List (`seller/pending/page.tsx`)**:
    *   **Action**: `processBuyerInvoice(invoiceId, action)`.
    *   **Polling Logic**: When `action === 'accept'`, the backend might take time to generate the PDF.
    *   **Implementation**: Client calls server action -> Server approves -> Server polls `fetch_invoice_status` internally until PDF is ready -> Returns Result.
    *   **Notification**: Triggers `sendBuyerStatusUpdateWithPdf` (WhatsApp) upon success.

---

## 3. Deployment & Security
*   **Authentication**:
    *   `verifyOTP` sets `etims_auth_token` cookie.
    *   Cookie attributes: `HttpOnly`, `Secure` (production), `Path=/`.
*   **Middleware**: (If applicable) protects `/etims/*` routes ensuring cookie presence.
*   **VAT Restriction**:
    *   `registerTaxpayer` action checks `has_vat` flag from KRA API.
    *   Hard block: If `true`, returns specific error code preventing account creation.
