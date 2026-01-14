### Solution Architecture: Secure WhatsApp WebView Gateway

This addresses KRA's requirement for a clear distinction between the **Public-Facing Interface** and the **Internal Secure Backend**. By validating the MSISDN directly with KRA services and using **Server-Side Secure Cookies**, the solution ensures that no sensitive data is exposed to the client-side browser or the public internet.

---

## 1. High-Level Solution Architecture

The following diagram illustrates the "Interconnection" between the external user, the public subdomain, and the private KRA API layer.

![alt text](<WhatsApp Image 2026-01-09 at 14.09.38.jpeg>)

---

## 2. Component Interconnection & Security Logic

To satisfy the request for "clear capture of all components," we categorize the interconnection into three secure stages:

### A. Subdomain Usage

- **Access Point:** All traffic originates from the subdomain `whatsapp.kra.go.ke`.
- **Validation:** Upon entry, the application extracts the `phone` parameter. It immediately makes a server-to-server call to the **KRA Identity Service** to verify if this MSISDN is active and authorized.
- **Token Issuance:** KRA's internal service returns a session token.

### B. Session Persistence (Secure Cookies)

- **Mechanism:** The token is stored in an **HTTP-only, Secure, SameSite=Strict** cookie.
- **Benefit:** This cookie is inaccessible to JavaScript. It cannot be read or stolen by scripts in the WebView, and it is only sent back to the server for subsequent requests.

### C. The API Proxy (Internal Communication)

- **Server Actions:** All data mutations (e.g., submitting an invoice) are handled via Next.js Server Actions.
- **Encapsulation:** The Server Action retrieves the token from the secure cookie and appends the **Internal API Secret Keys**.
- **Internal Path:** The request is then proxied to the `kratest.pesaflow.com` API via an internal KRA network route (VPC).

---

## 3. Final Deployment Requirements Checklist

| Category         | Component     | Requirement Specification                                                                                                                                       |
| ---------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Networking**   | **Subdomain** | A-Record for `whatsapp.kra.go.ke` pointing to KRA LB.                                                                                                           |
| **Compute**      | **App Host**  | The solution is built as a standard Node.js application. It can be deployed via Docker/Containerization or directly as a Node.js Runtime service on a Linux VM. |
| **Interconnect** | **Firewall**  | Whitelisted outbound HTTPS (Port 443) from App VM to Internal API IPs.                                                                                          |
| **Environment**  | **Secrets**   | All Upstream API URLs and Client Secrets stored as Env Vars on the host.                                                                                        |

---

### **Conclusion**

This architecture ensures that the "public" web app is merely a presentation layer. The actual **Solution Architecture** is an **Internal Secure Proxy** that uses KRA-validated tokens and server-side cookies.
