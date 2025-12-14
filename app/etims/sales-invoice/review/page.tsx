'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Button, TotalsCard, IdentityStrip } from '../../_components/Layout';
import { getSalesInvoice, Invoice, getUserSession } from '../../_lib/store';
import { submitInvoice } from '../../../actions/etims';
import { Loader2 } from 'lucide-react';

export default function SalesInvoiceReview() {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Partial<Invoice> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = getSalesInvoice();
    if (!saved || !saved.items || saved.items.length === 0) {
      router.push('/etims/sales-invoice/details');
      return;
    }
    setInvoice(saved);
  }, [router]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      const session = getUserSession();
      if (!session?.msisdn) {
        alert('User session not found. Please go back to home page.');
        return;
      }
  
      if (!invoice || !invoice.items) {
         alert('Invalid invoice data');
         return;
      }

      // Calculate total if not present
      const calculatedTotal = invoice.total || invoice.items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  
      const result = await submitInvoice({
        msisdn: session.msisdn,
        total_amount: calculatedTotal,
        items: invoice.items.map(item => ({
          item_name: item.name,
          taxable_amount: item.unitPrice,
          quantity: item.quantity
        }))
      });
  
      if (result.success) {
        router.push('/etims/sales-invoice/success');
      } else {
        alert(result.error || 'Failed to submit invoice');
      }
    } catch (error: any) {
      alert(error.message || 'An error occurred while submitting the invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted || !invoice) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Layout 
      title="Review Invoice" 
      step="Step 3 of 3"
      onBack={() => router.push('/etims/sales-invoice/details')}
    >
      <div className="space-y-4">
        {/* Buyer Info */}
        {invoice.buyer && (
          <IdentityStrip 
            label="Buyer"
            value={`${invoice.buyer.name} (${invoice.buyer.pin})`}
          />
        )}

        {/* Items Summary */}
        <Card>
          <h3 className="text-gray-900 font-medium mb-3">Items ({invoice.items?.length || 0})</h3>
          <div className="space-y-3">
            {invoice.items?.map((item) => (
              <div key={item.id} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                        {item.type}
                      </span>
                      <h4 className="text-gray-900 font-medium">{item.name}</h4>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  KES {item.unitPrice.toLocaleString()} × {item.quantity} = KES {(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Totals */}
        {invoice.subtotal !== undefined && invoice.tax !== undefined && invoice.total !== undefined && (
          <TotalsCard 
            subtotal={invoice.subtotal} 
            tax={invoice.tax} 
            total={invoice.total} 
          />
        )}

        {/* Actions */}
        {isGenerating ? (
          <Card className="bg-blue-50 border-blue-200">
            <div className="flex items-center justify-center gap-3 py-4">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-blue-900 font-medium">Generating Invoice...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            <Button onClick={handleGenerate}>
              Generate Invoice
            </Button>
            <Button variant="secondary" onClick={() => router.push('/etims/sales-invoice/details')}>
              Edit Details
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
