import React from 'react';
import { ProductCard } from './ProductCard';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import type { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  priceFilter: string;
  onPriceFilterChange: (price: string) => void;
  searchQuery: string;
  onResetFilters: () => void;
  onSelectProduct: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
  isLoading: boolean;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  priceFilter,
  onPriceFilterChange,
  searchQuery,
  onResetFilters,
  onSelectProduct,
  onQuickAdd,
  isLoading,
}) => {
  return (
    <section id="catalog-section" className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-stone-500 mb-1">
              Curated Catalog
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {activeCategory === 'All' ? 'All Studio Objects' : activeCategory}
            </h2>
          </div>

          <div className="text-xs text-stone-500 font-mono">
            Showing {products.length} {products.length === 1 ? 'object' : 'objects'}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="bg-white border border-stone-200/90 rounded-xl p-3 sm:p-4 mb-8 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Segmented Category Buttons (Functional filter buttons with active states) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => onSelectCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Secondary Controls: Price filter & Sorting */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Price Filter Selector */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={priceFilter}
                onChange={(e) => onPriceFilterChange(e.target.value)}
                className="bg-transparent text-xs text-stone-800 focus:outline-none cursor-pointer"
                aria-label="Filter by price"
              >
                <option value="all">All Prices</option>
                <option value="under-150">Under $150</option>
                <option value="150-400">$150 – $400</option>
                <option value="over-400">Over $400</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="bg-transparent text-xs text-stone-800 focus:outline-none cursor-pointer"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-4/3 bg-stone-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-5 bg-stone-200 rounded w-3/4" />
                  <div className="h-4 bg-stone-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          /* 3-Column Product Grid with 1440px desktop baseline */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
                onQuickAdd={onQuickAdd}
              />
            ))}
          </div>
        ) : (
          /* Empty Search or Filter State */
          <div className="text-center py-16 px-4 bg-white border border-stone-200 rounded-2xl max-w-lg mx-auto">
            <h3 className="text-lg font-serif font-semibold text-stone-900 mb-2">
              No matching objects found
            </h3>
            <p className="text-xs text-stone-500 mb-6 max-w-sm mx-auto">
              We couldn't find items matching your current filters. Try resetting the filters or modifying your search term.
            </p>
            <button
              onClick={onResetFilters}
              className="px-4 py-2 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
