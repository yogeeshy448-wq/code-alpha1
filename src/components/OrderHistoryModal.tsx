import React, { useState } from 'react';
import { X, Package, Truck, Calendar, MapPin, Search } from 'lucide-react';
import type { Order, User } from '../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: Order[];
  onSearchOrders: (email: string) => Promise<void>;
  onSelectOrderReceipt: (order: Order) => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onSearchOrders,
  onSelectOrderReceipt,
}) => {
  if (!isOpen) return null;

  const [lookupEmail, setLookupEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;
    setIsSearching(true);
    try {
      await onSearchOrders(lookupEmail.trim());
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/65 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-3xl my-auto rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-stone-900" />
            <div>
              <h2 className="text-base font-serif font-bold text-stone-900">
                Order History & Live Tracking
              </h2>
              <p className="text-xs text-stone-500">
                {user ? `Archive records for ${user.email}` : 'Track and inspect placed studio shipments'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close orders"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1 space-y-6">
          {/* Guest Email Lookup Bar */}
          {!user && (
            <form onSubmit={handleLookup} className="p-4 bg-stone-100/70 border border-stone-200 rounded-xl space-y-2">
              <label className="block text-xs font-medium text-stone-800">
                Look up orders by email address
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={lookupEmail}
                    onChange={(e) => setLookupEmail(e.target.value)}
                    placeholder="Enter order email address"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? 'Finding...' : 'Track Orders'}
                </button>
              </div>
            </form>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-stone-900">No placed orders found</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                No purchases have been recorded yet under this session or account.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusColor =
                  order.status === 'delivered'
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : order.status === 'shipped'
                    ? 'text-sky-700 bg-sky-50 border-sky-200'
                    : 'text-stone-700 bg-stone-100 border-stone-200';

                return (
                  <div
                    key={order.id}
                    className="p-5 bg-white border border-stone-200 rounded-xl space-y-4 hover:border-stone-300 transition-colors shadow-2xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-stone-900">{order.id}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded ${statusColor} capitalize`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-stone-500 text-[11px] mt-0.5">
                          Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-stone-900 tabular-nums">
                          ${order.total.toFixed(2)}
                        </span>
                        <button
                          onClick={() => onSelectOrderReceipt(order)}
                          className="px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors cursor-pointer"
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>

                    {/* Tracking status strip */}
                    <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2 bg-stone-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5 text-stone-500" />
                        <span className="font-medium text-stone-800">Tracking:</span>
                        <span className="font-mono text-stone-600">{order.trackingCode}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{order.estimatedDelivery}</span>
                      </div>
                    </div>

                    {/* Purchased items preview */}
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-9 h-9 rounded object-cover bg-stone-100"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-stone-800 font-medium">{item.name} × {item.quantity}</span>
                          </div>
                          <span className="font-mono text-stone-600 tabular-nums">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
