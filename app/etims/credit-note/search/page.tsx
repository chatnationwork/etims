'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Input, Button, Select } from '../../_components/Layout';
import { saveCreditNote, Invoice, getUserSession } from '../../_lib/store';
import { searchCreditNoteInvoice } from '../../../actions/etims';
import { Loader2, FileText, Search } from 'lucide-react';

const reasonOptions = [
  { value: 'missing_quantity', label: 'Missing Quantity' },
  { value: 'pricing_error', label: 'Pricing Error' },
  { value: 'damaged_goods', label: 'Damaged Goods' },
  { value: 'returned_goods', label: 'Returned Goods' },
  { value: 'duplicate', label: 'Duplicate Invoice' },
  { value: 'other', label: 'Other' },
];

export default function CreditNoteSearch() {
  const router = useRouter();
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [creditNoteType, setCreditNoteType] = useState<'partial' | 'full' | ''>('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const session = getUserSession();
    if (session?.msisdn) {
      setPhoneNumber(session.msisdn);
    }
  }, []);

  const handleSearch = async () => {
    setError('');
    
    if (!invoiceNumber.trim()) {
      setError('Please enter an invoice number');
      return;
    }

    if (!reason) {
      setError('Please select a reason for the credit note');
      return;
    }

    if (!creditNoteType) {
      setError('Please select a credit note type (Partial or Full)');
      return;
    }

    setLoading(true);

    try {
      const result = await searchCreditNoteInvoice(phoneNumber, invoiceNumber);
      
      if (result.success && result.invoice) {
        // Map API response to Store Invoice format
        const apiInvoice = result.invoice;
        const mappedInvoice: Invoice = {
          id: apiInvoice.invoice_id || apiInvoice.invoice_no,
          invoiceNumber: apiInvoice.invoice_no,
          buyer: {
            name: apiInvoice.buyer_name || 'Unknown Buyer',
            pin: ''
          },
          items: (apiInvoice.items || []).map((item, idx) => ({
             id: item.item_id || String(idx),
             type: 'product',
             name: item.item_name,
             unitPrice: item.unit_price,
             quantity: item.quantity
          })),
          total: apiInvoice.total_amount,
          subtotal: apiInvoice.total_amount,
          tax: 0,
          date: new Date().toISOString().split('T')[0],
          partialCreditUsed: false 
        };

        saveCreditNote({ 
          invoice: mappedInvoice, 
          msisdn: phoneNumber,
          type: creditNoteType as 'partial' | 'full',
          reason: reasonOptions.find(r => r.value === reason)?.label || reason
        });

        if (creditNoteType === 'full') {
          router.push('/etims/credit-note/full');
        } else {
          router.push('/etims/credit-note/partial-select');
        }
      } else {
        setError(result.error || 'Invoice not found. Please check the details and try again.');
      }
    } catch (err: any) {
      setError('Unable to find invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      title=""
      showHeader={false}
      onBack={() => router.push('/etims')}
    >
      <div className="space-y-4">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Search Invoice</h1>
          <p className="text-blue-100 text-sm">Enter invoice details to create a credit note</p>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="e.g., KRASRN0000*/1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your invoice number in any format (e.g., 001, INV-2024-001, KRASRN0000*/1)
            </p>
          </div>

          {/* Credit Note Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Credit Note Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCreditNoteType('partial')}
                className={`py-3 px-4 rounded-full border-2 font-medium transition-colors ${
                  creditNoteType === 'partial'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Partial
              </button>
              <button
                onClick={() => setCreditNoteType('full')}
                className={`py-3 px-4 rounded-full border-2 font-medium transition-colors ${
                  creditNoteType === 'full'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                Full
              </button>
            </div>
          </div>

          {/* Reason */}
          <Select
            label="Reason"
            value={reason}
            onChange={setReason}
            options={reasonOptions}
            required
          />

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Search Invoice
            </>
          )}
        </button>
      </div>
    </Layout>
  );
}
