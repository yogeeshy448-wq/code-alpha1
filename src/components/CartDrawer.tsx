import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Tag } from 'lucide-react';
import type { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: (appliedDiscountPercent: number) => void;
  onExploreItems: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onExploreItems,
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const subtotal = items.reduce((acc, item) => {
    return acc + (item.product ? item.product.price * item.quantity : 0);
  }, 0);

  const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const freeShippingThreshold = 150;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 15;
  const estimatedTax = Math.round(taxableSubtotal * 0.08 * 100) / 100;
  const total = Math.round((taxableSubtotal + shippingFee + estimatedTax) * 100) / 100;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'WELCOME10') {
      setDiscountPercent(10);
      setPromoSuccess('10% Welcome discount applied!');
      setPromoError('');
    } else if (clean === 'STUDIO15') {
      setDiscountPercent(15);
      setPromoSuccess('15% Studio Patron discount applied!');
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Try "WELCOME10".');
      setPromoSuccess('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-stone-900" />
            <h2 className="text-base font-serif font-bold text-stone-900">
              Shopping Bag ({items.reduce((acc, i) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-6 py-3 bg-stone-100/70 border-b border-stone-200 text-xs">
          {amountToFreeShipping > 0 ? (
            <div className="space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Free shipping progress</span>
                <span className="font-mono font-medium">${amountToFreeShipping.toFixed(0)} away</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-stone-900 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-stone-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>You have unlocked complimentary insured shipping!</span>
            </div>
          )}
        </div>

        {/* Itemized List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">Your bag is empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Explore our archive of craftsmanship objects, studio audio, and artisanal apothecary.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onExploreItems();
                }}
                className="px-4 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div
                  key={product.id}
                  className="flex gap-4 p-3 bg-stone-50/70 border border-stone-200/80 rounded-xl"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-18 h-18 object-cover rounded-lg bg-stone-200 shrink-0 border border-stone-200/60"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-semibold text-stone-900 truncate">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-stone-500 font-mono">
                          ${product.price} each
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-stone-300 rounded bg-white px-1">
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-mono text-xs font-semibold px-2 text-stone-900 tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.min(product.stockCount, item.quantity + 1))}
                          disabled={item.quantity >= product.stockCount}
                          className="p-1 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                        ${(product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-stone-50/70 space-y-4">
            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (WELCOME10)"
                    className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-lg text-stone-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {promoSuccess && <p className="text-[11px] text-emerald-700">{promoSuccess}</p>}
              {promoError && <p className="text-[11px] text-rose-600">{promoError}</p>}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-200">
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
                <span className="font-mono text-stone-900 tabular-nums">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200 font-semibold text-sm text-stone-900">
                <span>Total</span>
                <span className="font-mono text-base tabular-nums">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onProceedToCheckout(discountPercent)}
              className="w-full py-3.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
