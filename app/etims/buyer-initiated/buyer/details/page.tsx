'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Card, Input, Button } from '../../../_components/Layout';
import { saveBuyerInitiated, getBuyerInitiated, calculateTotals, InvoiceItem } from '../../../_lib/store';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';

export default function BuyerInitiatedDetails() {
  const router = useRouter();
  const [sellerName, setSellerName] = useState('');
  const [itemMode, setItemMode] = useState<'single' | 'multiple'>('single');
  const [taxType, setTaxType] = useState<'vat' | 'non-vat'>('non-vat');
  const [itemType, setItemType] = useState<'product' | 'service'>('product');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [invoiceDate] = useState(new Date().toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  }));

  useEffect(() => {
    setMounted(true);
    const saved = getBuyerInitiated();
    if (!saved?.sellerName) {
      router.push('/etims/buyer-initiated/buyer/create');
      return;
    }
    setSellerName(saved.sellerName);
    if (saved.items) {
      setItems(saved.items);
    }
  }, [router]);

  const totals = calculateTotals(items);

  const handleAddItem = () => {
    if (!itemName.trim()) {
      alert('Item name is required. Please enter a name for this item.');
      return;
    }
    
    if (!unitPrice || unitPrice.trim() === '') {
      alert('Unit price is required. Please enter the price for this item.');
      return;
    }
    
    const price = parseFloat(unitPrice);
    if (isNaN(price) || price <= 0) {
      alert('Invalid price. Please enter a price greater than 0.');
      return;
    }
    
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert('Invalid quantity. Please enter a quantity of at least 1.');
      return;
    }

    const newItem: InvoiceItem = {
      id: editingId || Date.now().toString(),
      type: itemType,
      name: itemName.trim(),
      description: description.trim() || undefined,
      unitPrice: price,
      quantity: qty,
    };

    if (editingId) {
      setItems(items.map(item => item.id === editingId ? newItem : item));
      setEditingId(null);
    } else {
      setItems([...items, newItem]);
    }

    // Clear form
    setItemName('');
    setDescription('');
    setUnitPrice('');
    setQuantity('1');
    setItemType('product');

    // If single item mode, go to preview
    if (itemMode === 'single') {
      saveBuyerInitiated({ items: [newItem], amount: newItem.unitPrice * newItem.quantity, taxType });
      router.push('/etims/buyer-initiated/buyer/review');
    }
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingId(item.id);
    setItemType(item.type);
    setItemName(item.name);
    setDescription(item.description || '');
    setUnitPrice(item.unitPrice.toString());
    setQuantity(item.quantity.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveItem = (id: string) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setItems(items.filter(item => item.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setItemName('');
        setDescription('');
        setUnitPrice('');
        setQuantity('1');
      }
    }
  };

  const handleContinue = () => {
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }
    saveBuyerInitiated({ items, amount: totals.total, taxType });
    router.push('/etims/buyer-initiated/buyer/review');
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <Layout 
      title="Item Creation"
      showHeader={false}
      onBack={() => router.push('/etims/buyer-initiated/buyer/create')}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white">
          <h1 className="text-xl font-bold mb-1">Item Creation</h1>
          <p className="text-blue-100 text-sm">Screen 3 of 4 - Define transaction items</p>
          <div className="mt-3 flex items-center gap-2 text-blue-100 text-sm">
            <span>Seller:</span>
            <span className="font-medium text-white">{sellerName}</span>
          </div>
        </div>

        {/* Item Mode Selection */}
        <Card>
          <p className="text-sm text-gray-700 font-medium mb-3">Item Type Selection</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setItemMode('single')}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                itemMode === 'single'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              Single Item
            </button>
            <button
              onClick={() => setItemMode('multiple')}
              className={`py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                itemMode === 'multiple'
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}
            >
              Multiple Items
            </button>
          </div>
        </Card>

        {/* Tax Information */}
        <Card>
          <p className="text-sm text-gray-700 font-medium mb-3">Type of Tax</p>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <span className="text-gray-900 font-medium">Non-VAT</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Default</span>
          </div>
        </Card>

        {/* Item Details */}
        <Card>
          <h3 className="text-gray-900 font-medium mb-4">Item Details</h3>
          
          {/* Product/Service Toggle */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Item Type</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setItemType('product')}
                className={`py-3 rounded-xl border-2 font-medium transition-all ${
                  itemType === 'product'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setItemType('service')}
                className={`py-3 rounded-xl border-2 font-medium transition-all ${
                  itemType === 'service'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Services
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product/Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description <span className="text-gray-400">(max 600 chars)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, 600))}
                placeholder="Optional description"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{description.length}/600</p>
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-gray-900">{invoiceDate}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Add Item Button */}
          <button
            onClick={handleAddItem}
            className="w-full mt-4 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {editingId ? (
              <>
                <Edit2 className="w-4 h-4" />
                Update Item
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {itemMode === 'single' ? 'Add Item & Continue' : 'Add Item'}
              </>
            )}
          </button>
        </Card>

        {/* Added Items List (Multiple mode only) */}
        {itemMode === 'multiple' && items.length > 0 && (
          <Card>
            <h3 className="text-gray-900 font-medium mb-3">Items ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                          {item.type}
                        </span>
                        <h4 className="text-gray-900 font-medium">{item.name}</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × KES {item.unitPrice.toLocaleString()} = KES {(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 p-4 bg-gray-900 rounded-xl text-white">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Amount</span>
                <span className="text-2xl font-bold">KES {totals.total.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        )}

        {/* Continue Button (Multiple mode) */}
        {itemMode === 'multiple' && items.length > 0 && (
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            Continue
          </button>
        )}
      </div>
    </Layout>
  );
}
