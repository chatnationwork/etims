'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Card, Input, Button } from '../../../_components/Layout';
import { fetchInvoices } from '../../../../actions/etims';
import { FetchedInvoice } from '../../../_lib/definitions';
import { ChevronRight, Loader2, Phone, User } from 'lucide-react';
import { getUserSession } from '../../../_lib/store';

function SellerInvoicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'pending';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneSet, setIsPhoneSet] = useState(false);
  const [invoices, setInvoices] = useState<FetchedInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');

  const getTitle = () => {
    switch(statusFilter) {
      case 'completed': return 'Completed Invoices';
      case 'rejected': return 'Rejected Invoices';
      default: return 'Pending Invoices';
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
        setInvoices(result.invoices);
      } else {
        setError(result.error || 'No invoices found');
        if (result.success && !result.invoices) {
            setInvoices([]);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices');
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
    router.push(`/etims/buyer-initiated/seller/view?id=${invoiceId}&phone=${encodeURIComponent(phoneNumber)}`);
  };

  if (initializing) {
    return (
        <Layout title={getTitle()} onBack={() => router.push('/etims/buyer-initiated')}>
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
                <p className="text-gray-500">Loading...</p>
            </div>
        </Layout>
    );
  }

  return (
    <Layout 
      title={getTitle()}
      onBack={() => {
        if (isPhoneSet && !getUserSession()?.msisdn) {
          setIsPhoneSet(false);
          setInvoices([]);
        } else {
          router.push('/etims/buyer-initiated');
        }
      }}
    >
      <div className="space-y-4">
        {!isPhoneSet ? (
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-900 font-medium pb-2 border-b border-gray-100">
                <Phone className="w-5 h-5 text-gray-500" />
                <h3>Enter Your Phone Number</h3>
              </div>
              <p className="text-sm text-gray-600">
                Enter your phone number to check invoices you have sent.
              </p>
              <Input
                label="Phone Number"
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="e.g. 0712345678"
                required
              />
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button 
                onClick={handleFetchInvoices} 
                disabled={!phoneNumber.trim() || loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Checking...</span>
                  </div>
                ) : 'View Invoices'}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p>Fetching invoices...</p>
                </div>
            ) : invoices.length === 0 ? (
              <Card className="text-center py-8">
                <p className="text-gray-600">No sent invoices found for {phoneNumber}</p>
                {!getUserSession()?.msisdn && (
                    <div className="mt-4">
                        <Button variant="secondary" onClick={() => setIsPhoneSet(false)}>Check Another Number</Button>
                    </div>
                )}
              </Card>
            ) : (
              <>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <p className="text-xs text-amber-800 font-medium">This flow is only for testing</p>
                </div>
                
                <div className="space-y-3">
                {invoices.map((invoice, idx) => (
                  <button
                    key={invoice.invoice_id || idx}
                    onClick={() => handleInvoiceClick(invoice)}
                    className="w-full text-left transition-all hover:bg-gray-50 rounded-xl"
                  >
                    <Card className="border border-gray-200 shadow-sm hover:border-blue-300">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                            <h4 className="text-gray-900 font-bold text-lg">{invoice.reference || invoice.invoice_id || 'N/A'}</h4>
                            <p className="text-xs text-gray-500">(Tap to open)</p>
                        </div>
                        <span className="text-gray-900 font-bold text-lg">
                            {(invoice.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      <div className="border-t border-gray-100 my-3"></div>

                      <div className="flex items-end justify-between">
                        <div className="text-sm text-gray-600 space-y-1">
                            {/* In Seller View: 'Buyer' is the other party (name in list), 'Seller' is Me */}
                            <p><span className="font-medium text-gray-500">Buyer:</span> {invoice.seller_name}</p> 
                            <p><span className="font-medium text-gray-500">Seller:</span> Me</p>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full">
                            <User className="w-5 h-5 text-gray-500" />
                        </div>
                      </div>
                    </Card>
                  </button>
                ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default function BuyerInitiatedSellerInvoices() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SellerInvoicesContent />
    </Suspense>
  );
}
