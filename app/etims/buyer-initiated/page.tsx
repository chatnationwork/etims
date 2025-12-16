'use client';

import { useRouter } from 'next/navigation';
import { Layout, Card } from '../_components/Layout';
import { Clock, CheckCircle, XCircle, FilePlus, Home, LogOut } from 'lucide-react';

export default function BuyerInitiatedHome() {
  const router = useRouter();

  const buyerActions = [
    {
      title: 'Create Invoice',
      description: 'Create a new buyer-initiated invoice',
      icon: FilePlus,
      color: 'blue' as const,
      onClick: () => router.push('/etims/buyer-initiated/buyer/create'),
    },
    {
      title: 'Pending Invoices',
      description: 'Invoices waiting for seller approval',
      icon: Clock,
      color: 'yellow' as const,
      onClick: () => router.push('/etims/buyer-initiated/buyer/invoices?status=pending'),
    },
    {
      title: 'Approved Invoices',
      description: 'Successfully approved by seller',
      icon: CheckCircle,
      color: 'green' as const,
      onClick: () => router.push('/etims/buyer-initiated/buyer/invoices?status=approved'),
    },
    {
      title: 'Rejected Invoices',
      description: 'Declined by seller',
      icon: XCircle,
      color: 'red' as const,
      onClick: () => router.push('/etims/buyer-initiated/buyer/invoices?status=rejected'),
    },
  ];

  const sellerActions = [
    {
      title: 'Pending Invoice',
      description: 'Invoices awaiting your action',
      icon: Clock,
      color: 'orange' as const,
      onClick: () => router.push('/etims/buyer-initiated/seller/pending'),
    },
    {
      title: 'Approved Invoice',
      description: 'Invoices you have approved',
      icon: CheckCircle,
      color: 'green' as const,
      onClick: () => router.push('/etims/buyer-initiated/seller/pending?status=approved'),
    },
    {
      title: 'Rejected Invoice',
      description: 'Invoices you have declined',
      icon: XCircle,
      color: 'red' as const,
      onClick: () => router.push('/etims/buyer-initiated/seller/pending?status=rejected'),
    },
  ];

  const navigationActions = [
    {
      title: 'Go to Main Menu',
      icon: Home,
      onClick: () => router.push('/etims'),
    },
    {
      title: 'Logout',
      icon: LogOut,
      onClick: () => {
        if (confirm('Are you sure you want to logout?')) {
          sessionStorage.clear();
          router.push('/etims');
        }
      },
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 active:bg-blue-100',
    yellow: 'bg-yellow-50 border-yellow-200 active:bg-yellow-100',
    green: 'bg-green-50 border-green-200 active:bg-green-100',
    red: 'bg-red-50 border-red-200 active:bg-red-100',
    orange: 'bg-orange-50 border-orange-200 active:bg-orange-100',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    orange: 'text-orange-600 bg-orange-100',
  };

  type ActionItem = {
    title: string;
    description?: string;
    icon: typeof Clock;
    color?: 'blue' | 'yellow' | 'green' | 'red' | 'orange';
    onClick: () => void;
  };

  const ActionButton = ({ action }: { action: ActionItem }) => {
    const Icon = action.icon;
    const color = action.color || 'blue';

    return (
      <button
        onClick={action.onClick}
        className={`w-full text-left transition-all rounded-xl border-2 p-4 ${colorClasses[color]} active:scale-[0.98]`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold text-base truncate">{action.title}</p>
            {action.description && (
              <p className="text-gray-500 text-sm truncate">{action.description}</p>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <Layout 
      title="Buyer Initiated" 
      onBack={() => router.push('/etims')}
    >
      <div className="space-y-6">
        {/* Role Selection Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Select your role:</strong> Are you creating an invoice (Buyer) or receiving one (Seller)?
          </p>
        </div>

        {/* Buyer Actions */}
        <div>
          <h2 className="text-gray-900 font-bold text-lg mb-3">👤 Buyer</h2>
          <div className="space-y-3">
            {buyerActions.map((action) => (
              <ActionButton key={action.title} action={action} />
            ))}
          </div>
        </div>

        {/* Seller Actions */}
        <div>
          <h2 className="text-gray-900 font-bold text-lg mb-3">🏪 Seller</h2>
          <div className="space-y-3">
            {sellerActions.map((action) => (
              <ActionButton key={action.title} action={action} />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-3">
            {navigationActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium text-sm transition-colors active:scale-[0.98]"
                >
                  <Icon className="w-4 h-4" />
                  <span>{action.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
