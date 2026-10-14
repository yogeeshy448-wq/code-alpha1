import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, LogOut, Package, Search } from 'lucide-react';
import type { User } from '../types';

interface NavbarProps {
  user: User | null;
  cartCount: number;
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  cartCount,
  activeCategory,
  onSelectCategory,
  onOpenCart,
  onOpenAuth,
  onOpenOrders,
  onLogout,
  searchQuery,
  onSearchChange,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const categories = [
    { id: 'All', label: 'All Catalog' },
    { id: 'Furniture', label: 'Furniture' },
    { id: 'Audio & Studio', label: 'Studio Audio' },
    { id: 'Apothecary', label: 'Apothecary' },
    { id: 'Apparel & Objects', label: 'Apparel' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          {/* Zone 1: Brand Wordmark */}
          <button
            onClick={() => onSelectCategory('All')}
            className="text-2xl font-serif font-semibold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity text-left cursor-pointer"
          >
            Kōbō Store
          </button>

          {/* Zone 2: Single-line Category Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`relative py-1 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive ? 'text-stone-950 font-semibold' : 'hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action Area */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Inline search bar toggle */}
            <div className="relative flex items-center">
              {showSearchInput ? (
                <div className="flex items-center bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 shadow-xs w-48 sm:w-64 transition-all">
                  <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search objects..."
                    className="w-full text-xs text-stone-800 placeholder-stone-400 bg-transparent focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      setShowSearchInput(false);
                      onSearchChange('');
                    }}
                    className="text-xs text-stone-400 hover:text-stone-600 ml-1 px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer"
                  title="Search items"
                  aria-label="Search items"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Account Profile / Login Button */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 text-xs font-medium text-stone-800 bg-stone-200/60 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-4 h-4 text-stone-700" />
                    <span className="hidden sm:inline-block max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                  </button>

                  {showUserDropdown && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-lg py-2 z-50 text-xs text-stone-700"
                      onMouseLeave={() => setShowUserDropdown(false)}
                    >
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-stone-900 truncate">{user.name}</p>
                        <p className="text-stone-500 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onOpenOrders();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 hover:bg-stone-50 transition-colors cursor-pointer"
                      >
                        <Package className="w-4 h-4 text-stone-500" />
                        <span>Order History & Tracking</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onLogout();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center gap-2.5 text-stone-600 hover:bg-stone-50 transition-colors border-t border-stone-100 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-stone-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-2 text-xs font-medium text-stone-800 hover:text-stone-950 hover:bg-stone-200/50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer shadow-xs whitespace-nowrap"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Bag</span>
              <span className="font-mono text-xs bg-stone-700 text-stone-100 px-1.5 py-0.2 rounded-md">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
