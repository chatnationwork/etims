'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Card, Button } from '../../../_components/Layout';
import { fetchInvoices, processBuyerInvoice } from '../../../../actions/etims';
import { FetchedInvoice } from '../../../_lib/definitions';
import { Loader2, Download, ArrowLeft, User, Store } from 'lucide-react';

function SellerViewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const phone = searchParams.get('phone');
  
  const [invoice, setInvoice] = useState<FetchedInvoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | ''>('');

  useEffect(() => {
    if (!id || !phone) {
      setIsLoading(false);
      if (!phone) setError('Phone number missing');
      else setError('Invoice ID missing');
      return;
    }

    const loadInvoice = async () => {
      try {
        const result = await fetchInvoices(phone);
        if (result.success && result.invoices) {
          const found = result.invoices.find(inv => 
            inv.reference === id || inv.invoice_id === id
          );
          
          if (found) {
            setInvoice(found);
          } else {
            setError('Invoice not found');
          }
        } else {
          setError(result.error || 'Failed to fetch invoices');
        }
      } catch (err: any) {
        setError(err.message || 'Error loading invoice');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvoice();
  }, [id, phone]);

  const handleSubmit = async () => {
    if (!selectedAction || !invoice || !phone || !id) return;
    
    setIsProcessing(true);
    
    try {
      const action = selectedAction === 'approve' ? 'accept' : 'reject';
      await processBuyerInvoice(phone, id, action);
      router.push(`/etims/buyer-initiated/seller/success?action=${selectedAction}`);
    } catch (err: any) {
      alert(`Failed to ${selectedAction} invoice: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement actual PDF generation
    alert('PDF download will be available soon');
  };

  if (isLoading) {
    return (
      <Layout title="Invoice Details" onBack={() => router.back()}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-500">Loading invoice...</p>
        </div>
      </Layout>
    );
  }

  if (error || !invoice) {
    return (
      <Layout title="Error" onBack={() => router.back()}>
        <Card className="p-8 text-center">
          <p className="text-red-600 mb-4">{error || 'Invoice not found'}</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </Card>
      </Layout>
    );
  }

  const isPending = !invoice.status || invoice.status === 'pending';
  const isReadOnly = !isPending;

  return (
    <Layout 
      title="Invoice Details"
      showHeader={false}
      onBack={() => router.push('/etims/buyer-initiated/seller/pending')}
    >
      <div className="space-y-4">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Invoice Details</h1>
              <p className="text-blue-100 text-sm">
                {isPending ? 'Review and take action' : `Status: ${invoice.status?.toUpperCase()}`}
              </p>
            </div>
          </div>
          <div className="text-sm text-blue-100">
            Invoice: {invoice.reference || invoice.invoice_id}
          </div>
        </div>

        {/* Buyer & Seller Info */}
        <div className="grid grid-cols-1 gap-3">
          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Buyer Name</p>
                <p className="text-gray-900 font-medium">{invoice.buyer_name || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Store className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Supplier/Seller</p>
                <p className="text-gray-900 font-medium">{invoice.seller_name || 'You'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
            <h3 className="text-gray-900 font-semibold">Line Items</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {invoice.items && invoice.items.map((item, i) => (
              <div key={i} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-gray-900 font-medium flex-1">{item.item_name}</h4>
                  <span className="text-gray-900 font-bold">
                    KES {(item.unit_price * item.quantity).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Unit Price: KES {item.unit_price.toLocaleString()}</span>
                  <span>Qty: {item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="bg-gray-900 p-4 text-white">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Amount</span>
              <span className="text-2xl font-bold">KES {invoice.total_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </button>

        {/* Decision Actions (Only for Pending) */}
        {isPending && (
          <>
            <Card>
              <p className="text-sm text-gray-700 font-medium mb-3">Decision</p>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAction === 'approve' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="action"
                    value="approve"
                    checked={selectedAction === 'approve'}
                    onChange={(e) => setSelectedAction(e.target.value as 'approve')}
                    className="w-5 h-5 text-green-600"
                  />
                  <span className={`font-medium ${selectedAction === 'approve' ? 'text-green-700' : 'text-gray-700'}`}>
                    Approve
                  </span>
                </label>

                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedAction === 'reject' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="action"
                    value="reject"
                    checked={selectedAction === 'reject'}
                    onChange={(e) => setSelectedAction(e.target.value as 'reject')}
                    className="w-5 h-5 text-red-600"
                  />
                  <span className={`font-medium ${selectedAction === 'reject' ? 'text-red-700' : 'text-gray-700'}`}>
                    Reject
                  </span>
                </label>
              </div>
            </Card>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedAction || isProcessing}
              className={`w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors ${
                selectedAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : selectedAction === 'reject'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </>
        )}

        {/* Read-Only Status (for approved/rejected) */}
        {isReadOnly && (
          <div className={`p-4 rounded-xl text-center font-medium ${
            invoice.status === 'approved' || invoice.status === 'accepted'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            Status: {invoice.status?.toUpperCase()}
          </div>
        )}

        {/* Go Back Link */}
        <button 
          onClick={() => router.push('/etims/buyer-initiated/seller/pending')}
          className="w-full text-center text-blue-600 text-sm font-medium py-3 flex items-center justify-center gap-2 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back to Invoices
        </button>
      </div>
    </Layout>
  );
}

export default function SellerView() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SellerViewContent />
    </Suspense>
  );
}
