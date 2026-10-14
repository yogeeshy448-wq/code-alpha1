import React from 'react';
import { CheckCircle2, Package, Truck, ArrowRight, Printer, MapPin, Calendar } from 'lucide-react';
import type { Order } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onViewOrders,
}) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-2xl my-auto rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Success Header Banner */}
        <div className="p-6 md:p-8 bg-stone-900 text-white text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-stone-800 text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="text-xs font-mono text-stone-300 uppercase tracking-widest mb-1">
            Order Confirmed · Preparing Shipment
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white mb-2">
            Thank you, {order.customerName.split(' ')[0]}
          </h2>
          <p className="text-xs text-stone-300 max-w-md">
            Your studio archive order <span className="font-mono text-white font-semibold">{order.id}</span> has been processed. A receipt has been sent to <span className="text-white font-medium">{order.userEmail}</span>.
          </p>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1 space-y-6">
          {/* Tracking Strip */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-stone-700" />
                <span className="font-semibold text-stone-900">Courier Tracking Code:</span>
                <span className="font-mono text-stone-700 bg-stone-200 px-2 py-0.5 rounded">
                  {order.trackingCode}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                <Calendar className="w-3.5 h-3.5" />
                <span>{order.estimatedDelivery}</span>
              </div>
            </div>

            {/* Stepper progress */}
            <div className="grid grid-cols-4 gap-2 pt-2 text-[11px] text-center font-medium">
              <div className="text-stone-900">
                <div className="h-1 bg-stone-900 rounded mb-1" />
                <span>Placed</span>
              </div>
              <div className="text-stone-900">
                <div className="h-1 bg-stone-900 rounded mb-1" />
                <span>Confirmed</span>
              </div>
              <div className="text-stone-400">
                <div className="h-1 bg-stone-200 rounded mb-1" />
                <span>In Transit</span>
              </div>
              <div className="text-stone-400">
                <div className="h-1 bg-stone-200 rounded mb-1" />
                <span>Delivered</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-2">
                <MapPin className="w-3.5 h-3.5 text-stone-600" />
                <span>Shipping Destination</span>
              </div>
              <p className="text-stone-700">{order.customerName}</p>
              <p className="text-stone-600">{order.shippingAddress.street}</p>
              <p className="text-stone-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p className="text-stone-500 font-mono mt-1">{order.customerPhone}</p>
            </div>

            <div className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 mb-2">
                <Package className="w-3.5 h-3.5 text-stone-600" />
                <span>Payment & Invoicing</span>
              </div>
              <p className="text-stone-700 capitalize font-medium">
                {order.paymentMethod === 'card' ? 'Credit Card (Processed)' : 'Cash on Delivery'}
              </p>
              <p className="text-stone-500 text-[11px] mt-1">Status: Paid & Reserved</p>
              <button
                onClick={handlePrint}
                className="mt-3 inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-medium cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Studio Receipt</span>
              </button>
            </div>
          </div>

          {/* Purchased Items List */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
              Itemized Receipt
            </h4>
            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-white">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md bg-stone-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-semibold text-stone-900">{item.name}</p>
                      <p className="text-stone-500 text-[11px] font-mono">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-stone-900 tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Math */}
          <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-stone-900 tabular-nums">${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span className="font-mono tabular-nums">-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Insured Courier Shipping</span>
              <span className="font-mono text-stone-900 tabular-nums">
                {order.shippingFee === 0 ? 'Free' : `$${order.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sales Tax (8%)</span>
              <span className="font-mono text-stone-900 tabular-nums">${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-semibold text-stone-900">
              <span>Total Paid</span>
              <span className="font-mono text-base tabular-nums">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-stone-200 bg-stone-50/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              onClose();
              onViewOrders();
            }}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors cursor-pointer"
          >
            View in My Orders
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
