import React, { useState } from 'react';
import { X, CreditCard, Banknote, ShieldCheck, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import type { CartItem, User, Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  discountPercent: number;
  onPlaceOrder: (orderPayload: any) => Promise<Order>;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  user,
  discountPercent,
  onPlaceOrder,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  // Form State
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+1 (555) 438-2910');
  
  // Shipping Address
  const [street, setStreet] = useState(user?.address?.street || '452 Studio Boulevard');
  const [city, setCity] = useState(user?.address?.city || 'Seattle');
  const [state, setState] = useState(user?.address?.state || 'WA');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '98101');
  const [country, setCountry] = useState(user?.address?.country || 'United States');

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'apple_pay'>('card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Math Calculations
  const subtotal = items.reduce((acc, item) => {
    return acc + (item.product ? item.product.price * item.quantity : 0);
  }, 0);
  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = subtotal >= 150 ? 0 : 15;
  const tax = Math.round(taxableSubtotal * 0.08 * 100) / 100;
  const total = Math.round((taxableSubtotal + shippingFee + tax) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !userEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Please provide your name, email, and phone number.');
      return;
    }
    if (!street.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please provide a complete shipping address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await onPlaceOrder({
        customerName: customerName.trim(),
        userEmail: userEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        paymentMethod,
        promoDiscountPercent: discountPercent,
      });

      onOrderSuccess(order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment or order processing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/65 backdrop-blur-xs flex justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-4xl my-auto rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-stone-700" />
            <h2 className="text-base font-serif font-bold text-stone-900">
              Secure Checkout
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Split: Form on Left, Order Summary on Right */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Columns: Checkout Details Form */}
            <div className="lg:col-span-7 space-y-6">
              {/* Error banner */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Step 1: Contact Information */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                  01. Customer Contact
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Elena Rostova"
                      className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="e.g. elena@example.com"
                      className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Destination */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                  02. Shipping Address
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street name and apartment / suite number"
                      className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal Code"
                        className="w-full text-xs bg-stone-50/80 border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-3">
                  03. Payment Method
                </h3>
                
                {/* Method selector buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 border rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-stone-800" />
                    <div>
                      <p className="text-xs font-semibold text-stone-900">Credit Card</p>
                      <p className="text-[10px] text-stone-500">Visa, Mastercard, Amex</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 border rounded-xl flex items-center gap-3 transition-colors text-left cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-stone-900 bg-stone-50/80 ring-1 ring-stone-900'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-stone-800" />
                    <div>
                      <p className="text-xs font-semibold text-stone-900">Cash on Delivery</p>
                      <p className="text-[10px] text-stone-500">Pay courier on arrival</p>
                    </div>
                  </button>
                </div>

                {/* Conditional Payment Details */}
                {paymentMethod === 'card' ? (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs font-mono bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Expiration (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full text-xs font-mono bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-700 mb-1">
                          Security CVC
                        </label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full text-xs font-mono bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 space-y-1">
                    <p className="font-semibold text-stone-900">Cash on Delivery Terms:</p>
                    <p>No upfront digital transaction needed. You can pay with exact cash or mobile terminal upon physical delivery by the courier.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right 5 Columns: Order Summary Card */}
            <div className="lg:col-span-5 bg-stone-50/90 border border-stone-200 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-4 pb-2 border-b border-stone-200">
                  Order Summary
                </h3>

                {/* Items preview */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => {
                    const product = item.product;
                    if (!product) return null;
                    return (
                      <div key={product.id} className="flex items-center gap-3 text-xs">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover bg-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 truncate">{product.name}</p>
                          <p className="text-stone-500 text-[11px] font-mono">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-mono text-stone-900 font-semibold tabular-nums">
                          ${(product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Summary numbers */}
                <div className="mt-6 pt-4 border-t border-stone-200 space-y-2 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono text-stone-900 tabular-nums">${subtotal.toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="font-mono tabular-nums">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-mono text-stone-900 tabular-nums">
                      {shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-mono text-stone-900 tabular-nums">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-stone-200 text-sm font-semibold text-stone-900">
                    <span>Total Amount</span>
                    <span className="font-mono text-base tabular-nums">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="mt-6 pt-4 border-t border-stone-200">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Place Order (${total.toFixed(2)})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                  <span>256-bit encrypted checkout with studio receipt</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
