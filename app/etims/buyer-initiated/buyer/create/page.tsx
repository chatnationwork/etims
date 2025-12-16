'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Input, Button } from '../../../_components/Layout';
import { saveBuyerInitiated } from '../../../_lib/store';
import { CheckCircle, Building2, User, Loader2 } from 'lucide-react';
import { lookupCustomer } from '../../../../actions/etims';
import { PINOrIDInput, isValidPINOrID } from '../../../../_components/KRAInputs';

export default function BuyerInitiatedCreate() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<'b2b' | 'b2c'>('b2b');
  const [sellerPinOrId, setSellerPinOrId] = useState('');
  const [isPinValid, setIsPinValid] = useState(false);
  const [sellerInfo, setSellerInfo] = useState<{ pin: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // For screen 2 - Seller details
  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');

  const maskPin = (pin: string) => {
    if (pin.length <= 4) return pin;
    return pin.slice(0, 4) + '*'.repeat(pin.length - 4);
  };

  const maskName = (name: string) => {
    const parts = name.split(' ');
    return parts.map((part, idx) => {
      if (idx === 0) return part; // Keep first name
      if (part.length <= 2) return part;
      return part[0] + '*'.repeat(part.length - 1);
    }).join(' ');
  };

  const handleValidate = async () => {
    setError('');
    
    if (!sellerPinOrId.trim()) {
      setError('Please enter Seller PIN or ID');
      return;
    }

    // B2B requires PIN format only
    if (transactionType === 'b2b' && !/^[A-Z]\d{9}[A-Z]$/i.test(sellerPinOrId.trim())) {
      setError('B2B transactions require a valid KRA PIN (e.g., A012345678Z)');
      return;
    }

    setLoading(true);
    
    try {
      const result = await lookupCustomer(sellerPinOrId.trim());
      if (result.success && result.customer) {
        setSellerInfo({ pin: result.customer.pin, name: result.customer.name });
        setShowDetailsForm(true);
      } else {
        setError(result.error || 'Seller not found. Please check the PIN/ID and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while validating seller.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToItems = () => {
    if (!sellerInfo) return;
    
    const cleanPhone = sellerPhone.trim().replace(/[^\d]/g, '');
    if (!cleanPhone || cleanPhone.length <= 9) {
      setError('Please enter a valid phone number (more than 9 digits)');
      return;
    }

    saveBuyerInitiated({ 
      sellerName: sellerInfo.name, 
      sellerPin: sellerInfo.pin,
      sellerPhone: sellerPhone.trim(),
      sellerEmail: sellerEmail.trim() || undefined,
      transactionType
    });
    router.push('/etims/buyer-initiated/buyer/details');
  };

  const handleEditSeller = () => {
    setSellerInfo(null);
    setShowDetailsForm(false);
    setSellerPinOrId('');
    setSellerPhone('');
    setSellerEmail('');
    setError('');
  };

  return (
    <Layout 
      title="Create Invoice" 
      showHeader={false}
      onBack={() => router.push('/etims/buyer-initiated')}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold mb-1">
            {!showDetailsForm ? 'Seller Validation' : 'Seller Details'}
          </h1>
          <p className="text-blue-100 text-sm">
            {!showDetailsForm 
              ? 'Screen 1 of 4 - Verify the seller' 
              : 'Screen 2 of 4 - Confirm seller contact'}
          </p>
        </div>

        {!showDetailsForm ? (
          <>
            {/* Transaction Type Toggle */}
            <Card>
              <p className="text-sm text-gray-700 font-medium mb-3">Transaction Type</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTransactionType('b2b')}
                  className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all ${
                    transactionType === 'b2b'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">B2B</span>
                </button>
                <button
                  onClick={() => setTransactionType('b2c')}
                  className={`flex items-center justify-center gap-2 py-4 px-4 rounded-xl border-2 transition-all ${
                    transactionType === 'b2c'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">B2C</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {transactionType === 'b2b' 
                  ? 'Business to Business - Requires seller KRA PIN' 
                  : 'Business to Customer - Accepts PIN or ID'}
              </p>
            </Card>

            {/* Seller PIN/ID Input */}
            <Card>
              <PINOrIDInput
                label="Enter Seller PIN/ID"
                value={sellerPinOrId}
                onChange={setSellerPinOrId}
                onValidationChange={setIsPinValid}
                helperText={transactionType === 'b2b' 
                  ? 'Enter seller KRA PIN only' 
                  : 'Enter PIN or ID number'}
              />
            </Card>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Validate Button */}
            <button
              onClick={handleValidate}
              disabled={!sellerPinOrId.trim() || loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate'
              )}
            </button>
          </>
        ) : sellerInfo && (
          <>
            {/* Seller Verified Card */}
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-green-900 font-medium mb-2">Seller Verified</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">PIN/ID of Seller</p>
                      <p className="text-gray-900 font-medium">{maskPin(sellerInfo.pin)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Name of Seller</p>
                      <p className="text-gray-900 font-medium">{maskName(sellerInfo.name)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Contact Information */}
            <Card>
              <h3 className="text-gray-900 font-medium mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    placeholder="+254..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    placeholder="seller@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleContinueToItems}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
              >
                Continue
              </button>
              <button
                onClick={handleEditSeller}
                className="w-full py-4 border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Edit Seller Details
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
