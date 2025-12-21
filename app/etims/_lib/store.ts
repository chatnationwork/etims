// Simple state management for the eTIMS application

export interface BuyerInfo {
  pin: string;
  name: string;
  msisdn?: string;
}

export interface InvoiceItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  description?: string;
  unitPrice: number;
  quantity: number;
  item_name?: string;
  total_amount?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  buyer?: BuyerInfo;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: string;
  partialCreditUsed?: boolean;
}

export interface CreditNoteData {
  invoice?: Invoice;
  msisdn?: string;
  type?: 'full' | 'partial';
  reason?: string;
  items?: Array<{
    item: InvoiceItem;
    quantity: number;
    total_amount: string;
    item_name: string;
  }>;
}

export interface BuyerInitiatedInvoice {
  id: string;
  invoiceRef: string;
  sellerName: string;
  sellerPin?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  buyerName: string;
  buyerPin?: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'approved';
  items: InvoiceItem[];
  date: string;
  rejectionReason?: string;
  transactionType?: 'b2b' | 'b2c';
  taxType?: 'vat' | 'non-vat';
}

// Storage keys
const SALES_INVOICE_KEY = 'etims_sales_invoice';
const CREDIT_NOTE_KEY = 'etims_credit_note';
const BUYER_INITIATED_KEY = 'etims_buyer_initiated';

// Sales Invoice Store
export const saveSalesInvoice = (data: Partial<Invoice>) => {
  if (typeof window === 'undefined') return;
  const existing = getSalesInvoice() || {};
  const updated = { ...existing, ...data };
  sessionStorage.setItem(SALES_INVOICE_KEY, JSON.stringify(updated));
};

export const getSalesInvoice = (): Partial<Invoice> | null => {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(SALES_INVOICE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearSalesInvoice = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(SALES_INVOICE_KEY);
};

// Credit Note Store
export const saveCreditNote = (data: Partial<CreditNoteData>) => {
  if (typeof window === 'undefined') return;
  const existing = getCreditNote() || {};
  const updated = { ...existing, ...data };
  sessionStorage.setItem(CREDIT_NOTE_KEY, JSON.stringify(updated));
};

export const getCreditNote = (): CreditNoteData | null => {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(CREDIT_NOTE_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearCreditNote = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CREDIT_NOTE_KEY);
};

// Buyer Initiated Store
export const saveBuyerInitiated = (data: Partial<BuyerInitiatedInvoice>) => {
  if (typeof window === 'undefined') return;
  const existing = getBuyerInitiated() || {};
  const updated = { ...existing, ...data };
  sessionStorage.setItem(BUYER_INITIATED_KEY, JSON.stringify(updated));
};

export const getBuyerInitiated = (): Partial<BuyerInitiatedInvoice> | null => {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(BUYER_INITIATED_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearBuyerInitiated = () => {
  sessionStorage.removeItem(BUYER_INITIATED_KEY);
};

// User Session Store
// User Session Store
const USER_SESSION_KEY = 'etims_user_session';
const KNOWN_PHONE_KEY = 'etims_known_phone';
const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export interface UserSession {
  msisdn: string;
  name?: string;
  pin?: string;
  lastActive: number; // timestamp
}

export const saveKnownPhone = (phone: string) => {
  if (typeof window === 'undefined' || !phone) return;
  localStorage.setItem(KNOWN_PHONE_KEY, phone);
};

export const getKnownPhone = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(KNOWN_PHONE_KEY);
};

export const saveUserSession = (data: Omit<UserSession, 'lastActive'>) => {
  if (typeof window === 'undefined') return;
  const session: UserSession = {
    ...data,
    lastActive: Date.now()
  };
  sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  if (data.msisdn) {
    saveKnownPhone(data.msisdn);
  }
};

export const refreshSession = () => {
  if (typeof window === 'undefined') return;
  const session = getUserSession();
  if (session) {
    session.lastActive = Date.now();
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
  }
};

export const getUserSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null;
  const data = sessionStorage.getItem(USER_SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const isSessionValid = (): boolean => {
  const session = getUserSession();
  if (!session) return false;
  
  const elapsed = Date.now() - session.lastActive;
  return elapsed < SESSION_TIMEOUT_MS;
};

export const clearUserSession = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(USER_SESSION_KEY);
};

// Calculate totals
export const calculateTotals = (items: InvoiceItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = 0; // Removed VAT calculation as requested
  const total = subtotal;
  return { subtotal, tax, total };
};
