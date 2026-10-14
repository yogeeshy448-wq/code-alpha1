import React, { useState } from 'react';
import { X, Star, Check, Truck, ShieldCheck, Plus, Minus, ArrowLeft } from 'lucide-react';
import type { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product, quantity: number) => void;
  onAddReview: (productId: string, review: { author: string; rating: number; comment: string }) => Promise<void>;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onAddReview,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');
  const [justAdded, setJustAdded] = useState(false);

  // Review form states
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    setIsSubmittingReview(true);
    try {
      await onAddReview(product.id, {
        author: reviewAuthor.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewAuthor('');
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-5xl my-auto rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <div className="text-xs font-mono text-stone-500">
            {product.category} · Ref {product.id}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto p-6 md:p-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Product Gallery / Image Display */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="aspect-4/3 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-xs">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Trust Badges Bar */}
              <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl grid grid-cols-2 gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-stone-800 shrink-0" />
                  <div>
                    <p className="font-semibold text-stone-900">Complimentary Dispatch</p>
                    <p className="text-[11px] text-stone-500">{product.leadTime || 'In stock — ready to ship'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-stone-800 shrink-0" />
                  <div>
                    <p className="font-semibold text-stone-900">Craft Guarantee</p>
                    <p className="text-[11px] text-stone-500">30-day return window</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="lg:col-span-6 flex flex-col">
              {/* Product Metadata & Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span>{product.category}</span>
                <div className="flex items-center gap-1.5 text-stone-800">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(product.rating)
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs font-semibold">{product.rating.toFixed(1)}</span>
                  <span className="text-stone-400">({product.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="text-sm text-stone-600 mb-4">{product.subtitle}</p>

              {/* Price & Stock status */}
              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-stone-200">
                <span className="font-mono text-3xl font-bold text-stone-900 tabular-nums">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="font-mono text-lg text-stone-400 line-through tabular-nums">
                    ${product.originalPrice}
                  </span>
                )}
                <span className="ml-auto text-xs font-medium text-stone-600">
                  {product.inStock ? `${product.stockCount} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Description Prose */}
              <p className="text-stone-700 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Quantity Selector & Action Buttons */}
              <div className="space-y-4 pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-700">Quantity</span>
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50 p-1">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-1 hover:bg-stone-200 rounded text-stone-700 disabled:opacity-40 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-semibold px-3 text-stone-900 tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                      disabled={quantity >= product.stockCount}
                      className="p-1 hover:bg-stone-200 rounded text-stone-700 disabled:opacity-40 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className={`py-3 px-4 text-xs font-semibold rounded-lg border transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                      justAdded
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-900 border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Bag</span>
                      </>
                    ) : (
                      <span>Add to Bag</span>
                    )}
                  </button>

                  <button
                    onClick={handleBuy}
                    disabled={!product.inStock}
                    className="py-3 px-4 text-xs font-semibold rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Tabbed Info Details (Overview / Specs / Reviews) */}
              <div className="mt-8 pt-6 border-t border-stone-200">
                <div className="flex items-center gap-6 border-b border-stone-200 text-xs font-medium pb-2 mb-4">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 -mb-2.5 transition-colors cursor-pointer ${
                      activeTab === 'overview'
                        ? 'text-stone-900 border-b-2 border-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Features
                  </button>
                  <button
                    onClick={() => setActiveTab('specs')}
                    className={`pb-2 -mb-2.5 transition-colors cursor-pointer ${
                      activeTab === 'specs'
                        ? 'text-stone-900 border-b-2 border-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Specifications
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 -mb-2.5 transition-colors cursor-pointer ${
                      activeTab === 'reviews'
                        ? 'text-stone-900 border-b-2 border-stone-900 font-semibold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Reviews ({product.reviews.length})
                  </button>
                </div>

                {activeTab === 'overview' && (
                  <ul className="space-y-2 text-xs text-stone-600">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-2.5 text-xs text-stone-600">
                    {product.dimensions && (
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-medium text-stone-700">Dimensions</span>
                        <span className="font-mono text-stone-600">{product.dimensions}</span>
                      </div>
                    )}
                    {product.materials && (
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-medium text-stone-700">Materials</span>
                        <span>{product.materials}</span>
                      </div>
                    )}
                    {product.leadTime && (
                      <div className="flex justify-between py-1 border-b border-stone-100">
                        <span className="font-medium text-stone-700">Lead Time</span>
                        <span>{product.leadTime}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Add Review Form */}
                    <form onSubmit={handleSubmitReview} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                      <h4 className="text-xs font-semibold text-stone-900">Write a Customer Review</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={reviewAuthor}
                          onChange={(e) => setReviewAuthor(e.target.value)}
                          placeholder="Your name (e.g. Maya S.)"
                          required
                          className="w-full text-xs bg-white border border-stone-200 rounded-lg px-3 py-2 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-stone-600">Rating:</span>
                          <select
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-2 text-stone-900 focus:outline-none cursor-pointer"
                          >
                            <option value={5}>5 - Exceptional</option>
                            <option value={4}>4 - Very Good</option>
                            <option value={3}>3 - Good</option>
                            <option value={2}>2 - Fair</option>
                            <option value={1}>1 - Poor</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your thoughts on craftsmanship, materials, and daily use..."
                        rows={2}
                        required
                        className="w-full text-xs bg-white border border-stone-200 rounded-lg p-3 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                      <div className="flex items-center justify-between">
                        {reviewSuccess ? (
                          <span className="text-xs text-stone-900 font-medium">Review submitted successfully!</span>
                        ) : <span />}
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Post Review'}
                        </button>
                      </div>
                    </form>

                    {/* Review List */}
                    <div className="space-y-4">
                      {product.reviews.map((rev) => (
                        <div key={rev.id} className="pb-4 border-b border-stone-100 last:border-0">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-stone-900">{rev.author}</span>
                            <span className="font-mono text-stone-400">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 mb-1.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
