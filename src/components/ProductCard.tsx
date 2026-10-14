import React, { useState } from 'react';
import { Plus, Check, Star } from 'lucide-react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickAdd,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAdding || !product.inStock) return;
    setIsAdding(true);
    onQuickAdd(product);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setIsAdding(false);
    }, 1200);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-white border border-stone-200/90 rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
    >
      {/* Product Image Slot */}
      <div className="relative aspect-4/3 bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Quick Add Overlay on Hover */}
        <div className="absolute bottom-3 right-3 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          {product.inStock ? (
            <button
              onClick={handleQuickAdd}
              disabled={isAdding}
              aria-label={`Quick add ${product.name} to bag`}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 cursor-pointer ${
                justAdded
                  ? 'bg-stone-900 text-white'
                  : 'bg-white/95 text-stone-900 hover:bg-stone-900 hover:text-white backdrop-blur-xs'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Quick Add</span>
                </>
              )}
            </button>
          ) : (
            <span className="px-2.5 py-1 text-[11px] font-medium bg-stone-200 text-stone-600 rounded-md">
              Sold Out
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed Metadata Header (NO PILLS) */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className={product.inStock ? 'text-stone-600' : 'text-stone-400'}>
                {product.inStock ? `${product.stockCount} left` : 'Out of stock'}
              </span>
            </div>

            <div className="flex items-center gap-1 text-stone-700">
              <Star className="w-3 h-3 fill-stone-800 text-stone-800" />
              <span className="font-mono text-[11px] font-medium">{product.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-semibold text-stone-900 group-hover:text-stone-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Product Subtitle */}
          <p className="text-xs text-stone-500 line-clamp-2 mt-1 mb-3">
            {product.subtitle}
          </p>
        </div>

        {/* Pricing Area */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-base font-semibold text-stone-900 tabular-nums">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-xs text-stone-400 line-through tabular-nums">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <span className="text-xs text-stone-500 group-hover:text-stone-900 font-medium transition-colors">
            View Details →
          </span>
        </div>
      </div>
    </div>
  );
};
