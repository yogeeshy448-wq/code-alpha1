import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import type { Product, User, CartItem, Order, UserAddress } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { AuthModal } from './components/AuthModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { Footer } from './components/Footer';
import { Toast, type ToastMessage } from './components/Toast';

export default function App() {
  // App state
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceFilter, setPriceFilter] = useState<string>('all');

  // Modals & Panels
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeDiscountPercent, setActiveDiscountPercent] = useState(0);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);

  // Direct checkout override items (e.g. for "Buy Now" on PDP)
  const [directCheckoutItems, setDirectCheckoutItems] = useState<CartItem[] | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial User & Cart
  useEffect(() => {
    const initApp = async () => {
      try {
        const currentUser = await api.getMe();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to get current user:', err);
      }

      try {
        const cart = await api.getCart();
        setCartItems(cart);
      } catch (err) {
        console.error('Failed to get cart:', err);
      }
    };

    initApp();
  }, []);

  // Fetch Products whenever filters change
  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    try {
      let minPrice: number | undefined;
      let maxPrice: number | undefined;

      if (priceFilter === 'under-150') {
        maxPrice = 150;
      } else if (priceFilter === '150-400') {
        minPrice = 150;
        maxPrice = 400;
      } else if (priceFilter === 'over-400') {
        minPrice = 400;
      }

      const list = await api.getProducts({
        category: activeCategory,
        search: searchQuery,
        sort: sortBy,
        minPrice,
        maxPrice,
      });
      setProducts(list);
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Could not load products. Please refresh.', 'error');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [activeCategory, searchQuery, sortBy, priceFilter, showToast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load orders when user changes or orders modal opens
  const loadOrders = useCallback(async (emailOverride?: string) => {
    try {
      const email = emailOverride || user?.email;
      const userOrders = await api.getUserOrders(email);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user, loadOrders]);

  // Cart operations
  const handleAddToCart = async (product: Product, quantity = 1) => {
    try {
      const updatedCart = await api.addToCart(product.id, quantity);
      setCartItems(updatedCart);
      showToast(`Added ${quantity} × ${product.name} to bag`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add item to bag', 'error');
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    try {
      const updatedCart = await api.updateCartQuantity(productId, quantity);
      setCartItems(updatedCart);
    } catch (err: any) {
      showToast(err.message || 'Failed to update quantity', 'error');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      const updatedCart = await api.removeFromCart(productId);
      setCartItems(updatedCart);
      showToast('Item removed from bag', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to remove item', 'error');
    }
  };

  // Buy Now on PDP: opens checkout immediately with just this item
  const handleBuyNow = (product: Product, quantity: number) => {
    setDirectCheckoutItems([
      {
        productId: product.id,
        quantity,
        product,
      },
    ]);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  };

  // Proceed to checkout from drawer
  const handleProceedToCheckout = (discount: number) => {
    setActiveDiscountPercent(discount);
    setDirectCheckoutItems(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Order Placement
  const handlePlaceOrder = async (orderPayload: any): Promise<Order> => {
    const finalPayload = {
      ...orderPayload,
      customItems: directCheckoutItems ? directCheckoutItems.map(i => ({ productId: i.productId, quantity: i.quantity })) : undefined,
    };

    const newOrder = await api.createOrder(finalPayload);
    // Reload cart and products to reflect stock changes
    const updatedCart = await api.getCart();
    setCartItems(updatedCart);
    loadProducts();
    loadOrders();
    return newOrder;
  };

  const handleOrderSuccess = (order: Order) => {
    setIsCheckoutOpen(false);
    setConfirmedOrder(order);
    showToast(`Order ${order.id} placed successfully!`, 'success');
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string): Promise<User> => {
    const res = await api.login(email, pass);
    setUser(res.user);
    // Refresh cart for this user
    const updatedCart = await api.getCart();
    setCartItems(updatedCart);
    loadOrders(res.user.email);
    showToast(`Welcome back, ${res.user.name.split(' ')[0]}!`);
    return res.user;
  };

  const handleRegister = async (payload: { name: string; email: string; password: string; phone?: string; address?: UserAddress }): Promise<User> => {
    const res = await api.register(payload);
    setUser(res.user);
    const updatedCart = await api.getCart();
    setCartItems(updatedCart);
    loadOrders(res.user.email);
    showToast(`Account created. Welcome to Kōbō Store, ${res.user.name}!`);
    return res.user;
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setOrders([]);
    const updatedCart = await api.getCart();
    setCartItems(updatedCart);
    showToast('Signed out of account', 'info');
  };

  // Review submission
  const handleAddReview = async (productId: string, review: { author: string; rating: number; comment: string }) => {
    const updated = await api.addReview(productId, review);
    setSelectedProduct(updated);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast('Your review has been posted. Thank you!');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const categories = ['All', 'Furniture', 'Audio & Studio', 'Apothecary', 'Apparel & Objects'];

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-stone-900 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        user={user}
        cartCount={totalCartCount}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToCatalog();
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenOrders={() => {
          loadOrders();
          setIsOrdersOpen(true);
        }}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Editorial Storefront Hero */}
        <Hero onExploreClick={scrollToCatalog} />

        {/* 3-Column Catalog Grid */}
        <ProductGrid
          products={products}
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          priceFilter={priceFilter}
          onPriceFilterChange={setPriceFilter}
          searchQuery={searchQuery}
          onResetFilters={() => {
            setActiveCategory('All');
            setSearchQuery('');
            setPriceFilter('all');
            setSortBy('featured');
          }}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onQuickAdd={(p) => handleAddToCart(p, 1)}
          isLoading={isLoadingProducts}
        />
      </main>

      {/* Restrained Editorial Footer */}
      <Footer
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          scrollToCatalog();
        }}
        onOpenOrders={() => {
          loadOrders();
          setIsOrdersOpen(true);
        }}
      />

      {/* Product Details Modal (PDP) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onAddReview={handleAddReview}
      />

      {/* Shopping Bag Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
        onExploreItems={scrollToCatalog}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setDirectCheckoutItems(null);
        }}
        items={directCheckoutItems || cartItems}
        user={user}
        discountPercent={activeDiscountPercent}
        onPlaceOrder={handlePlaceOrder}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Order Confirmation & Tracking Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => {
          setConfirmedOrder(null);
          loadOrders();
          setIsOrdersOpen(true);
        }}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onAuthSuccess={() => setIsAuthOpen(false)}
      />

      {/* Order History & Tracking Modal */}
      <OrderHistoryModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        user={user}
        orders={orders}
        onSearchOrders={async (email) => {
          await loadOrders(email);
        }}
        onSelectOrderReceipt={(order) => {
          setIsOrdersOpen(false);
          setConfirmedOrder(order);
        }}
      />

      {/* Non-intrusive Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
