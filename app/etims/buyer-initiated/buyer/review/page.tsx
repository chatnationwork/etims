'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button } from '../../../_components/Layout';
import { submitBuyerInitiatedInvoice } from '../../../../actions/etims';
import { getBuyerInitiated, BuyerInitiatedInvoice, calculateTotals, getUserSession } from '../../../_lib/store';
import { Loader2, Edit2, Send, FileText, User, Store } from 'lucide-react';

export default function BuyerInitiatedReview() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Partial<BuyerInitiatedInvoice> | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const saved = getBuyerInitiated();
    if (!saved || !saved.items || saved.items.length === 0 || !saved.sellerName) {
      router.push('/etims/buyer-initiated/buyer/details');
      return;
    }
    setInvoice(saved);
  }, [router]);

  const handleSubmit = async () => {
    setIsSending(true);
    setError('');
    
    try {
      const session = getUserSession();
      if (!session?.msisdn) {
        setError('User session not found. Please go back to home page.');
        setIsSending(false);
        return;
      }
  
      if (!invoice || !invoice.items || !invoice.sellerPin) {
        setError('Invalid invoice data: Missing items or Seller PIN');
        setIsSending(false);
        return;
      }

      const totals = calculateTotals(invoice.items);

      const result = await submitBuyerInitiatedInvoice({
        msisdn: session.msisdn,
        seller_pin: invoice.sellerPin,
        seller_msisdn: invoice.sellerPhone || '',
        total_amount: totals.total,
        items: invoice.items.map(item => ({
          item_name: item.name,
          taxable_amount: item.unitPrice,
          quantity: item.quantity
        }))
      });

      if (result.success) {
        router.push('/etims/buyer-initiated/buyer/success');
      } else {
        setError(result.error || 'Failed to submit invoice');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting the invoice');
    } finally {
      setIsSending(false);
    }
  };

  if (!mounted || !invoice) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  const totals = calculateTotals(invoice.items || []);

  return (
    <Layout 
      title="Invoice Preview"
      showHeader={false}
      onBack={() => router.push('/etims/buyer-initiated/buyer/details')}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Invoice Preview</h1>
              <p className="text-blue-100 text-sm">Screen 4 of 4 - Final review</p>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <Card className="border-l-4 border-l-purple-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Seller</p>
              <p className="text-gray-900 font-medium">{invoice.sellerName}</p>
            </div>
          </div>
        </Card>

        {/* Items Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <h3 className="text-gray-900 font-semibold">Items Summary</h3>
          </div>
          
          {/* Table Header */}
          <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase">
            <span>Product</span>
            <span className="text-center">Qty × Price</span>
            <span className="text-right">Total</span>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-100">
            {invoice.items?.map((item) => (
              <div key={item.id} className="grid grid-cols-3 gap-2 px-4 py-3 items-center">
                <div>
                  <p className="text-gray-900 font-medium">{item.name}</p>
                  <span className="text-xs text-gray-500">{item.type}</span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {item.quantity} × {item.unitPrice.toLocaleString()}
                </p>
                <p className="text-gray-900 font-medium text-right">
                  {(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="bg-gray-900 p-4 text-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-2xl font-bold">KES {totals.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Actions */}
        {isSending ? (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-blue-900 font-medium">Sending to Seller...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Submit
            </button>

            {/* Edit Button */}
            <button
              onClick={() => router.push('/etims/buyer-initiated/buyer/details')}
              className="w-full py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
              Edit
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
