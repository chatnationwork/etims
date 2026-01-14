
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const USER_MSISDN = '254745050238';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'x-forwarded-for': 'triple_2_ussd'
};

const TEST_BUYER_PIN = 'P051381665D'; // Use a valid-looking PIN if possible, or a test one.
// P051381665D is a random format guess, might fail lookup.
// Let's use the one from previous session logs if available: A016678608H (from logs in Step 395/396/450)
const VALID_BUYER_PIN = 'A016678608H'; 

interface TestResult {
  step: string;
  status: 'PASSED' | 'FAILED';
  endpoint: string;
  response?: any;
  error?: any;
}

const results: TestResult[] = [];

async function runTest(stepName: string, endpoint: string, method: 'GET' | 'POST', data?: any) {
  console.log(`\n--- Running Step: ${stepName} ---`);
  console.log(`Endpoint: ${method} ${BASE_URL}${endpoint}`);
  if (data) console.log('Payload:', JSON.stringify(data, null, 2));

  try {
    let response;
    if (method === 'GET') {
      response = await axios.get(`${BASE_URL}${endpoint}`, { headers: DEFAULT_HEADERS, timeout: 30000 });
    } else {
      response = await axios.post(`${BASE_URL}${endpoint}`, data, { headers: DEFAULT_HEADERS, timeout: 30000 });
    }

    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check reasonable success indicators
    const isSuccess = response.status >= 200 && response.status < 300; // Basic HTTP check
    // Some APIs return 200 but with success: false or code != 0/200
    // We will consider HTTP 200 as techincal success "Working API", even if logic fails (e.g. invalid PIN)
    // The user wants to know WHICH APIs are NOT WORKING.
    
    results.push({
      step: stepName,
      status: isSuccess ? 'PASSED' : 'FAILED',
      endpoint: endpoint,
      response: response.data
    });

    return response.data;
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('API Response Error Data:', JSON.stringify(error.response.data, null, 2));
    }
    results.push({
      step: stepName,
      status: 'FAILED',
      endpoint: endpoint,
      error: error.response?.data || error.message
    });
    return null;
  }
}

async function main() {
  console.log(`Starting eTIMS API Tests for User: ${USER_MSISDN}`);

  // 1. Lookup Customer (Used in Sales Invoice & Buyer Initiated)
  const lookupRes = await runTest(
    '1. Lookup Customer (Buyer)',
    '/buyer-initiated/lookup',
    'POST',
    { pin_or_id: VALID_BUYER_PIN } // Using valid PIN from logs
  );

  // 2. Submit Sales Invoice
  // Requires previous setup or just raw submission?
  await runTest(
    '2. Submit Sales Invoice',
    '/post-sale',
    'POST',
    {
        msisdn: USER_MSISDN,
        total_amount: 100, // Minimal amount
        items: [
            {
                item_name: "Test Item",
                taxable_amount: 100,
                quantity: 1
            }
        ]
    }
  );

  // 3. Buyer Initiated - Create Invoice
  // Requires valid buyer PIN (we used VALID_BUYER_PIN)
  await runTest(
    '3. Submit Buyer Initiated Invoice',
    '/buyer-initiated/submit/invoice',
    'POST',
    {
        msisdn: USER_MSISDN,
        buyer_pin: VALID_BUYER_PIN,
        total_amount: 150,
        items: [
            {
                item_name: "Consultation",
                taxable_amount: 150,
                quantity: 1
            }
        ]
    }
  );

  // 4. Fetch Invoices (Buyer View - My Invoices)
  // Logic: User checks what invoices they have received
  await runTest(
    '4. Fetch Invoices (Buyer View)',
    `/buyer-initiated/fetch/${USER_MSISDN}`,
    'GET'
  );

  // 5. Process Invoice (Accept/Reject)
  // We need an invoice Ref to process. 
  // If step 4 returned invoices, we pick one? Or we mock a ref?
  // Since we accept "FAILED" if flow is broken, we try with a mock or empty
  // Realistically we can't accept an invoice unless we have a real one.
  // We'll try with a dummy ref to see if API endpoint is reachable at least.
  await runTest(
    '5. Process Invoice (Action: Accept)',
    '/buyer-initiated/action/submit',
    'POST',
    {
        action: 'accept',
        msisdn: USER_MSISDN,
        invoice: 'BI-DUMMY-123' 
    }
  );

  // 6. Search Credit Note Invoice
  // Try searching for a potentially valid invoice no? or dummy.
  await runTest(
    '6. Search Credit Note Invoice',
    '/search/credit-note',
    'POST',
    {
        msisdn: USER_MSISDN,
        invoice_no: 'INV-TEST-001'
    }
  );

  // 7. Submit Credit Note
  await runTest(
    '7. Submit Credit Note (Partial)',
    '/submit/credit-note',
    'POST',
    {
        msisdn: USER_MSISDN,
        invoice_no: 'INV-TEST-001',
        credit_note_type: 'partial',
        reason: 'other',
        items: [
            {
                item_id: 'ITEM-001',
                return_quantity: 1
            }
        ]
    }
  );

  console.log('\n\n=== TEST SUMMARY ===');
  console.table(results.map(r => ({
      Step: r.step,
      Status: r.status,
      Endpoint: r.endpoint,
      Note: r.status === 'FAILED' ? (r.error?.message || JSON.stringify(r.error)?.substring(0, 50)) : 'OK'
  })));
}

main().catch(console.error);
