'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Layout, Card, Button } from '../_components/Layout';
import { checkUserStatus } from '../../actions/etims';
import { saveUserSession } from '../_lib/store';
import { Loader2, Phone } from 'lucide-react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const numberFromUrl = searchParams.get('number');
  
  const [phoneNumber, setPhoneNumber] = useState(numberFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill from URL but don't auto-check - let user confirm or change

  const handleCheckStatus = async (msisdn: string) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await checkUserStatus(msisdn);
      
      if (!result.success) {
        setError(result.error || 'Failed to check status');
        setLoading(false);
        return;
      }

      // Save session
      saveUserSession({ msisdn, name: result.name });

      if (result.isRegistered) {
        // User is registered - go to OTP verification
        const params = new URLSearchParams({
          number: msisdn,
          name: result.name || '',
          pin: result.pin || ''
        });
        router.push(`/etims/auth/login?${params.toString()}`);
      } else {
        // User not registered - go to signup
        router.push(`/etims/auth/signup?number=${encodeURIComponent(msisdn)}`);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }
    handleCheckStatus(phoneNumber);
  };

  return (
    <Layout title="eTIMS" showHeader={false}>
      <div className="min-h-[80vh] flex flex-col justify-center space-y-4">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-[var(--kra-red)] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">KRA</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">eTIMS Service</h1>
          <p className="text-sm text-gray-500">Kenya Revenue Authority</p>
        </div>

        {/* Phone Input */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 font-medium mb-1">
                <Phone className="w-3.5 h-3.5 inline mr-1" />
                Phone Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--kra-red)] focus:border-transparent"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading || !phoneNumber.trim()}>
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin inline mr-1" />Checking...</>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </Card>

        {/* Info */}
        <p className="text-center text-xs text-gray-400">
          Enter your registered phone number to access eTIMS services
        </p>
      </div>
    </Layout>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
