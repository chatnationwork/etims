# Release Notes

## 

### PDF Proxy for WhatsApp Document Delivery For eTIMs Sales Invoice

**What changed:**  
The `sendInvoiceCreditDocTemplate` function now automatically detects whether a PDF URL is publicly accessible before sending it via WhatsApp.

**How it works:**
- A HEAD request is made to the PDF URL before sending
- **If the URL is public (HTTP 200)** → the direct URL is used, skipping the proxy entirely
- **If the URL is not public (403, 401, timeout, etc.)** → the URL is routed through our authenticated proxy (`/api/proxy/pdf`)

**Why:**  
Most PDF links from the eTIMS API are publicly accessible and don't require proxying. The only exception is the **sales invoice PDF**, which is private and requires authentication. This update automatically detects which case applies — public PDFs are sent directly to WhatsApp, while the sales invoice PDF is routed through our authenticated proxy.

**Files changed:**
- `app/actions/etims.ts` — Added `isPdfUrlPublic()` helper, updated `sendInvoiceCreditDocTemplate()` logic

**To deploy this update:**

```bash
# 1. Pull the latest image
docker pull ghcr.io/chatnationwork/etims-app:latest

# 2. Stop and remove the running container
docker compose down

# 3. Redeploy with the updated image
docker compose up -d
```
