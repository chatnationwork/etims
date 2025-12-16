'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Card, Input, Button } from '../../../_components/Layout';
import { fetchInvoices } from '../../../../actions/etims';
import { FetchedInvoice } from '../../../_lib/definitions';
import { ChevronRight, Loader2, Phone, User, FileText, Check, Square, CheckSquare } from 'lucide-react';
import { getUserSession } from '../../../_lib/store';

function SellerPendingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'pending';
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneSet, setIsPhoneSet] = useState(false);
  const [invoices, setInvoices] = useState<FetchedInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());

  const getPageTitle = () => {
    switch (statusFilter) {
      case 'approved': return 'Approved Invoice';
      case 'rejected': return 'Rejected Invoice';
      default: return 'Pending Invoice';
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
        // Filter by status
        let filtered = result.invoices;
        if (statusFilter === 'approved') {
          filtered = result.invoices.filter(inv => inv.status === 'approved' || inv.status === 'accepted');
        } else if (statusFilter === 'rejected') {
          filtered = result.invoices.filter(inv => inv.status === 'rejected');
        } else {
          filtered = result.invoices.filter(inv => !inv.status || inv.status === 'pending');
        }
        setInvoices(filtered);
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

  const toggleInvoiceSelection = (invoiceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedInvoices);
    if (newSelected.has(invoiceId)) {
      newSelected.delete(invoiceId);
    } else {
      newSelected.add(invoiceId);
    }
    setSelectedInvoices(newSelected);
  };

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedInvoices.size === 0) {
      alert('Please select at least one invoice');
      return;
    }
    // For now, alert - actual implementation would process each
    alert(`${action === 'approve' ? 'Approving' : 'Rejecting'} ${selectedInvoices.size} invoice(s)...`);
  };

  if (initializing) {
    return (
      <Layout title={getPageTitle()} onBack={() => router.push('/etims/buyer-initiated')}>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title={getPageTitle()}
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
                Please enter your phone number to view invoices sent to you.
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
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No {statusFilter} invoices found</p>
                {!getUserSession()?.msisdn && (
                  <div className="mt-4">
                    <Button variant="secondary" onClick={() => setIsPhoneSet(false)}>Check Another Number</Button>
                  </div>
                )}
              </Card>
            ) : (
              <>
                {/* Bulk Actions (Only for pending) */}
                {statusFilter === 'pending' && selectedInvoices.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-sm text-blue-800 font-medium">
                      {selectedInvoices.size} selected
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleBulkAction('reject')}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg font-medium"
                      >
                        Reject
                      </button>
                      <button 
                        onClick={() => handleBulkAction('approve')}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                )}

                {/* Invoice List */}
                <div className="space-y-3">
                  {invoices.map((invoice, idx) => {
                    const invoiceId = invoice.invoice_id || invoice.reference || String(idx);
                    const isSelected = selectedInvoices.has(invoiceId);
                    
                    return (
                      <button
                        key={invoiceId}
                        onClick={() => handleInvoiceClick(invoice)}
                        className="w-full text-left transition-all active:scale-[0.98]"
                      >
                        <div className={`bg-white rounded-xl border-2 p-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                          {/* Header: ID and Amount */}
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              {/* Checkbox (only for pending) */}
                              {statusFilter === 'pending' && (
                                <div 
                                  onClick={(e) => toggleInvoiceSelection(invoiceId, e)}
                                  className="flex-shrink-0"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-6 h-6 text-blue-600" />
                                  ) : (
                                    <Square className="w-6 h-6 text-gray-400" />
                                  )}
                                </div>
                              )}
                              <div>
                                <h4 className="text-gray-900 font-bold text-lg">
                                  {invoice.reference || invoice.invoice_id || 'N/A'}
                                </h4>
                                <p className="text-xs text-gray-500">Tap to view details</p>
                              </div>
                            </div>
                            <span className="text-gray-900 font-bold text-lg">
                              {(invoice.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          {/* Divider */}
                          <div className="border-t border-gray-100 my-3"></div>

                          {/* Buyer & Seller */}
                          <div className="flex items-end justify-between">
                            <div className="text-sm space-y-1">
                              <p className="text-gray-600">
                                <span className="text-gray-400">Buyer:</span> {invoice.buyer_name || 'Unknown'}
                              </p>
                              <p className="text-gray-600">
                                <span className="text-gray-400">Seller:</span> {invoice.seller_name || 'You'}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default function SellerPending() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <SellerPendingContent />
    </Suspense>
  );
}
