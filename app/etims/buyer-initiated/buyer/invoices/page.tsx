'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Card, Button } from '../../../_components/Layout';
import { fetchInvoices } from '../../../../actions/etims';
import { FetchedInvoice } from '../../../_lib/definitions';
import { ChevronRight, Loader2, Phone, FileText } from 'lucide-react';
import { getUserSession } from '../../../_lib/store';

function BuyerInvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'pending';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneSet, setIsPhoneSet] = useState(false);
  const [invoices, setInvoices] = useState<FetchedInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  const getPageTitle = () => {
    switch (statusFilter) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Pending';
    }
  };

  useEffect(() => {
    const session = getUserSession();
    if (session?.msisdn) {
      setPhoneNumber(session.msisdn);
      setIsPhoneSet(true);
      fetchInvoicesData(session.msisdn);
    }
    setInitializing(false);
  }, []);

  const fetchInvoicesData = async (phone: string) => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await fetchInvoices(phone);
      if (result.success && result.invoices) {
        let filtered = result.invoices;
        if (statusFilter === 'approved') filtered = result.invoices.filter(inv => inv.status === 'approved' || inv.status === 'accepted');
        else if (statusFilter === 'rejected') filtered = result.invoices.filter(inv => inv.status === 'rejected');
        else filtered = result.invoices.filter(inv => !inv.status || inv.status === 'pending');
        setInvoices(filtered);
      } else {
        setError(result.error || 'No invoices found');
        if (result.success) setInvoices([]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchInvoices = () => { 
    if (phoneNumber) { 
      setIsPhoneSet(true); 
      fetchInvoicesData(phoneNumber); 
    }
  };

  const handleInvoiceClick = (invoice: FetchedInvoice) => {
    const invoiceId = invoice.invoice_id || invoice.reference;
    // Navigate to BUYER view, not seller view
    router.push(`/etims/buyer-initiated/buyer/view?id=${invoiceId}&phone=${encodeURIComponent(phoneNumber)}&status=${statusFilter}`);
  };

  if (initializing) {
    return (
      <Layout title={getPageTitle()} onBack={() => router.push('/etims/buyer-initiated')}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${getPageTitle()} Invoices`} onBack={() => router.push('/etims/buyer-initiated')}>
      <div className="space-y-3">
        {!isPhoneSet ? (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Enter Phone Number</span>
            </div>
            <input 
              type="tel" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              placeholder="0712345678"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg mb-2" 
            />
            {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
            <Button onClick={handleFetchInvoices} disabled={!phoneNumber.trim() || loading}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Checking...</> : 'View Invoices'}
            </Button>
          </Card>
        ) : (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : invoices.length === 0 ? (
              <Card className="text-center py-6">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No {statusFilter} invoices</p>
              </Card>
            ) : (
              <>
                {/* Invoice Table */}
                <Card>
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr className="border-b">
                        <th className="text-left py-1.5 px-1 font-medium text-gray-600">Invoice</th>
                        <th className="text-right py-1.5 px-1 font-medium text-gray-600">Amount</th>
                        <th className="w-6"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice, idx) => {
                        const invoiceId = invoice.invoice_id || invoice.reference || String(idx);
                        return (
                          <tr 
                            key={invoiceId} 
                            onClick={() => handleInvoiceClick(invoice)} 
                            className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
                          >
                            <td className="py-2 px-1">
                              <span className="font-medium text-gray-800">{invoice.reference || invoice.invoice_id || 'N/A'}</span>
                              <span className="block text-[10px] text-gray-400">Seller: {invoice.seller_name || 'Unknown'}</span>
                            </td>
                            <td className="py-2 px-1 text-right font-medium">{(invoice.total_amount || 0).toLocaleString()}</td>
                            <td className="py-2 px-1"><ChevronRight className="w-4 h-4 text-gray-400" /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default function BuyerInvoices() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm">Loading...</div>}>
      <BuyerInvoicesContent />
    </Suspense>
  );
}
