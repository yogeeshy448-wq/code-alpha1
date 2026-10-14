import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { Product, User, UserAddress, Order, CartItem } from '../src/types';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  products: Product[];
  orders: Order[];
  carts: Record<string, { productId: string; quantity: number }[]>;
  sessions: Record<string, string>; // token -> userId
}

const DB_PATH = path.resolve(process.cwd(), 'data', 'store_db.json');

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'kobo-chair-01',
    name: 'Kanso Sculptural Oak Armchair',
    subtitle: 'Hand-carved white oak with textured ivory bouclé',
    price: 680,
    originalPrice: 750,
    rating: 4.9,
    reviewCount: 38,
    category: 'Furniture',
    description: 'The Kanso Armchair is crafted from solid American white oak with joinery inspired by traditional Japanese woodwork. Upholstered in dense, stain-resistant Belgian bouclé for a cloud-like tactile seat that ages gracefully.',
    image: '/src/assets/images/product_sculptural_chair_1791970823028.jpg',
    inStock: true,
    stockCount: 14,
    features: [
      'Sustainably harvested solid American White Oak',
      'Belgian heavy bouclé wool blend (80,000 Martindale rubs)',
      'Traditional mortise and tenon joinery with brass dowels',
      'Matte natural hardwax-oil organic finish'
    ],
    dimensions: 'W 74cm × D 82cm × H 76cm (Seat height: 41cm)',
    materials: 'Solid White Oak, Natural Wool Bouclé, High-resilience Foam',
    leadTime: 'Dispatches within 48 hours',
    tags: ['Furniture', 'Handcrafted', 'Solid Wood', 'Living'],
    reviews: [
      {
        id: 'rev-c-1',
        author: 'Julian M.',
        rating: 5,
        date: '2026-09-18',
        comment: 'Even more striking in person. The proportion and tactile warmth of the oak make it the focal point of my studio reading room.',
        verified: true
      },
      {
        id: 'rev-c-2',
        author: 'Sophia Chen',
        rating: 5,
        date: '2026-09-02',
        comment: 'Exceptional build quality. The bouclé cushion provides deep comfort without sagging after months of daily use.',
        verified: true
      }
    ]
  },
  {
    id: 'kobo-audio-02',
    name: 'Acoustic Reference Studio Headphones',
    subtitle: 'Open-back planar magnetic transducers with brushed alloy',
    price: 495,
    originalPrice: 540,
    rating: 5.0,
    reviewCount: 64,
    category: 'Audio & Studio',
    description: 'Engineered for audio mastering engineers, composers, and dedicated audiophiles. Features ultra-thin 50mm planar diaphragms housed within machined anodized aluminum and ventilated microfiber headband pads for fatigue-free listening.',
    image: '/src/assets/images/product_studio_headphones_1791970823172.jpg',
    inStock: true,
    stockCount: 22,
    features: [
      '50mm planar magnetic drivers with neodymium N52 motor system',
      'CNC-milled aerospace grade 6061-T6 aluminum chassis',
      'Detachable 4.4mm balanced and 6.35mm gold-plated OFC cables',
      'Sub-0.08% Total Harmonic Distortion at 100dB SPL'
    ],
    dimensions: 'Weight: 375g · Frequency response: 8Hz – 48,000Hz',
    materials: 'Anodized Aluminum, Lambskin Memory Foam, Braided Silver-Copper',
    leadTime: 'In stock — ready to ship',
    tags: ['Audio', 'Audiophile', 'Studio', 'Acoustic'],
    reviews: [
      {
        id: 'rev-a-1',
        author: 'David Lindqvist',
        rating: 5,
        date: '2026-08-27',
        comment: 'Unrivaled soundstage separation. Bass is authoritative without bleeding into the midrange, and high frequencies shimmer with zero harshness.',
        verified: true
      },
      {
        id: 'rev-a-2',
        author: 'Elena Rostova',
        rating: 5,
        date: '2026-09-14',
        comment: 'As a mixing engineer, these have become my definitive reference cans. Utterly neutral, honest, and comfortable for 6-hour sessions.',
        verified: true
      }
    ]
  },
  {
    id: 'kobo-scent-03',
    name: 'Moments Eau de Parfum No. 7',
    subtitle: 'Wild Amber, Smoked Myrrh & Atlas Cedarwood (100ml)',
    price: 135,
    originalPrice: 150,
    rating: 4.8,
    reviewCount: 52,
    category: 'Apothecary',
    description: 'A contemplative unisex fragrance distilled in small batches in Grasse. Opens with sparkling bergamot and dry juniper berries, evolving into a heart of sacred myrrh and wild resinous amber, anchored by ancient cedar and vetiver.',
    image: '/src/assets/images/product_botanical_scent_1791970824312.jpg',
    inStock: true,
    stockCount: 35,
    features: [
      '24% concentrated perfume oil (Extrait de Parfum strength)',
      'Aged for six months in stainless steel barrels prior to bottling',
      'Hand-blown amber UV-resistant glass flacon with solid knurled brass cap',
      '100% cruelty-free, zero phthalates or synthetic preservatives'
    ],
    dimensions: '100ml / 3.4 fl. oz. · Hand-numbered batch',
    materials: 'Organic sugarcane alcohol, botanical essences, brass & glass',
    leadTime: 'In stock — ready to ship',
    tags: ['Fragrance', 'Apothecary', 'Amber', 'Artisanal'],
    reviews: [
      {
        id: 'rev-s-1',
        author: 'Marc V.',
        rating: 5,
        date: '2026-09-10',
        comment: 'Incredible longevity. The warm dry down of smoked myrrh has gotten me countless compliments wherever I go.',
        verified: true
      }
    ]
  },
  {
    id: 'kobo-bag-04',
    name: 'Heavy Selvedge Canvas Studio Tote',
    subtitle: '22oz Kurashiki cotton with bridle leather handles',
    price: 185,
    originalPrice: 210,
    rating: 4.9,
    reviewCount: 41,
    category: 'Apparel & Objects',
    description: 'Woven on vintage shuttle looms in Okayama, Japan, this utilitarian tote bag is cut from dense 22oz water-repellent paraffin-waxed cotton canvas. Reinforced with solid copper rivets and full-grain vegetable-tanned bridle leather handles.',
    image: '/src/assets/images/product_canvas_tote_1791970823667.jpg',
    inStock: true,
    stockCount: 19,
    features: [
      '22oz heavy selvedge canvas with paraffin water-repellent wax treatment',
      'Thick 4mm vegetable-tanned Wickett & Craig saddle leather handles',
      'Hand-hammered solid copper saddlery rivets',
      'Padded internal compartment sized for up to 16-inch laptops'
    ],
    dimensions: 'W 42cm × H 36cm × D 16cm (Handle drop: 24cm)',
    materials: '100% Cotton Selvedge Canvas, Full Grain Harness Leather',
    leadTime: 'In stock — ready to ship',
    tags: ['Apparel', 'Canvas', 'Japanese', 'Everyday Carry'],
    reviews: [
      {
        id: 'rev-b-1',
        author: 'Hannah K.',
        rating: 5,
        date: '2026-09-22',
        comment: 'Indestructible. It holds my laptop, sketchbook, coffee thermos, and daily essentials with structure and timeless aesthetic.',
        verified: true
      }
    ]
  },
  {
    id: 'kobo-ceramic-05',
    name: 'Hagi Stoneware Mineral Vase',
    subtitle: 'Coarse speckled clay with natural wood-ash glaze',
    price: 110,
    rating: 4.8,
    reviewCount: 29,
    category: 'Furniture',
    description: 'Wheel-thrown by studio potters using iron-rich mountain clay. Fired in a wood-burning climbing kiln over three days, resulting in unique organic variations in ash melting and earthy textured surface.',
    image: '/src/assets/images/hero_artisanal_goods_1791970822476.jpg',
    inStock: true,
    stockCount: 12,
    features: [
      'High-fired mineral stoneware, water-tight internal glazing',
      'Naturally variegated wood ash exterior finish',
      'Each piece is individually wheel-thrown and numbered'
    ],
    dimensions: 'Diameter 14cm × Height 22cm · Weight 1.2kg',
    materials: 'High-fire stoneware clay, natural wood ash glaze',
    leadTime: 'In stock — ready to ship',
    tags: ['Ceramics', 'Craft', 'Living', 'Minimalist'],
    reviews: [
      {
        id: 'rev-cer-1',
        author: 'Koji Sato',
        rating: 5,
        date: '2026-09-12',
        comment: 'The tactile texture of the raw clay brings peaceful balance to our dining table.',
        verified: true
      }
    ]
  },
  {
    id: 'kobo-audio-06',
    name: 'Minimalist Walnut Bluetooth Amplifier',
    subtitle: 'Class-D audiophile 100W desktop stereo receiver',
    price: 360,
    originalPrice: 395,
    rating: 4.7,
    reviewCount: 23,
    category: 'Audio & Studio',
    description: 'A compact high-fidelity audio receiver engineered with Texas Instruments TPA3255 chipset and LDAC Bluetooth 5.2 lossless streaming. Hand-finished walnut casing with machined brass rotary volume knob.',
    image: '/src/assets/images/product_studio_headphones_1791970823172.jpg',
    inStock: true,
    stockCount: 8,
    features: [
      '100W RMS per channel into 4Ω at 0.005% THD+N',
      'Hi-Res Audio certified with aptX HD and LDAC 990kbps codec',
      'Solid CNC carved walnut enclosure with isolated ground plane'
    ],
    dimensions: 'W 18cm × D 14cm × H 6.5cm',
    materials: 'Solid American Walnut, Brushed Aluminum, Gold Plated Terminals',
    leadTime: 'In stock — ready to ship',
    tags: ['Audio', 'Amplifier', 'Walnut', 'Studio'],
    reviews: [
      {
        id: 'rev-amp-1',
        author: 'Bradley Cooper',
        rating: 5,
        date: '2026-08-30',
        comment: 'Drives my bookshelf speakers with clarity and zero background hiss. The tactile feel of the brass dial is pure joy.',
        verified: true
      }
    ]
  }
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Ensure products are present or merged
        if (!parsed.products || parsed.products.length === 0) {
          parsed.products = INITIAL_PRODUCTS;
        }
        if (!parsed.users) parsed.users = [];
        if (!parsed.orders) parsed.orders = [];
        if (!parsed.carts) parsed.carts = {};
        if (!parsed.sessions) parsed.sessions = {};
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading db file, re-initializing default schema:', err);
    }

    // Default schema with seeded demo user
    const defaultSalt = crypto.randomBytes(16).toString('hex');
    const defaultHash = crypto.pbkdf2Sync('password123', defaultSalt, 1000, 64, 'sha512').toString('hex');

    const defaultUser: StoredUser = {
      id: 'usr-demo-01',
      name: 'Elena Rostova',
      email: 'elena@example.com',
      phone: '+1 (555) 234-5678',
      passwordHash: defaultHash,
      salt: defaultSalt,
      address: {
        street: '742 Evergreen Terrace',
        city: 'Portland',
        state: 'OR',
        postalCode: '97201',
        country: 'United States'
      },
      createdAt: '2026-09-01T10:00:00.000Z'
    };

    const initialSchema: DatabaseSchema = {
      users: [defaultUser],
      products: INITIAL_PRODUCTS,
      orders: [
        {
          id: 'KB-84192',
          userId: 'usr-demo-01',
          userEmail: 'elena@example.com',
          customerName: 'Elena Rostova',
          customerPhone: '+1 (555) 234-5678',
          shippingAddress: {
            street: '742 Evergreen Terrace',
            city: 'Portland',
            state: 'OR',
            postalCode: '97201',
            country: 'United States'
          },
          items: [
            {
              productId: 'kobo-scent-03',
              name: 'Moments Eau de Parfum No. 7',
              price: 135,
              quantity: 1,
              image: '/src/assets/images/product_botanical_scent_1791970824312.jpg'
            }
          ],
          subtotal: 135,
          shippingFee: 0,
          discount: 0,
          tax: 10.8,
          total: 145.8,
          status: 'delivered',
          paymentMethod: 'card',
          trackingCode: 'TRK-USPS-984210492',
          createdAt: '2026-09-15T14:22:00.000Z',
          estimatedDelivery: 'Delivered on September 19, 2026'
        }
      ],
      carts: {
        'usr-demo-01': [
          { productId: 'kobo-bag-04', quantity: 1 }
        ]
      },
      sessions: {
        'demo-token-active-session': 'usr-demo-01'
      }
    };

    this.saveData(initialSchema);
    return initialSchema;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Products ---
  public getProducts(filters?: {
    category?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Product[] {
    let result = [...this.data.products];

    if (filters?.category && filters.category !== 'All') {
      result = result.filter(p => p.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        p => p.name.toLowerCase().includes(q) ||
             p.subtitle.toLowerCase().includes(q) ||
             p.description.toLowerCase().includes(q) ||
             p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (typeof filters?.minPrice === 'number' && !isNaN(filters.minPrice)) {
      result = result.filter(p => p.price >= (filters.minPrice ?? 0));
    }
    if (typeof filters?.maxPrice === 'number' && !isNaN(filters.maxPrice)) {
      result = result.filter(p => p.price <= (filters.maxPrice ?? Infinity));
    }

    if (filters?.sort) {
      switch (filters.sort) {
        case 'price-asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
        default:
          // featured: keep default order
          break;
      }
    }

    return result;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id);
  }

  public addProductReview(productId: string, review: { author: string; rating: number; comment: string }): Product | null {
    const product = this.data.products.find(p => p.id === productId);
    if (!product) return null;

    const newReview = {
      id: `rev-${Date.now()}`,
      author: review.author,
      rating: review.rating,
      date: new Date().toISOString().split('T')[0],
      comment: review.comment,
      verified: true
    };

    product.reviews.unshift(newReview);
    product.reviewCount = product.reviews.length;
    const avg = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviewCount;
    product.rating = Math.round(avg * 10) / 10;

    this.saveData();
    return product;
  }

  // --- Auth & Users ---
  public registerUser(name: string, email: string, password: string, phone?: string, address?: UserAddress): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const existing = this.data.users.find(u => u.email === cleanEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const userId = `usr-${crypto.randomUUID().slice(0, 8)}`;

    const newUser: StoredUser = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      address,
      passwordHash,
      salt,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);

    const token = crypto.randomUUID();
    this.data.sessions[token] = userId;
    this.saveData();

    const { passwordHash: _, salt: __, ...sanitized } = newUser;
    return { user: sanitized, token };
  }

  public loginUser(email: string, password: string): { user: User; token: string } {
    const cleanEmail = email.toLowerCase().trim();
    const user = this.data.users.find(u => u.email === cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const testHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    if (testHash !== user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const token = crypto.randomUUID();
    this.data.sessions[token] = user.id;
    this.saveData();

    const { passwordHash: _, salt: __, ...sanitized } = user;
    return { user: sanitized, token };
  }

  public getUserByToken(token: string): User | null {
    if (!token) return null;
    const userId = this.data.sessions[token];
    if (!userId) return null;
    const user = this.data.users.find(u => u.id === userId);
    if (!user) return null;
    const { passwordHash: _, salt: __, ...sanitized } = user;
    return sanitized;
  }

  public logoutUser(token: string) {
    if (this.data.sessions[token]) {
      delete this.data.sessions[token];
      this.saveData();
    }
  }

  public updateUserProfile(userId: string, updates: { name?: string; phone?: string; address?: UserAddress }): User {
    const user = this.data.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found.');

    if (updates.name) user.name = updates.name.trim();
    if (updates.phone) user.phone = updates.phone.trim();
    if (updates.address) user.address = updates.address;

    this.saveData();
    const { passwordHash: _, salt: __, ...sanitized } = user;
    return sanitized;
  }

  // --- Cart ---
  public getCart(sessionId: string): CartItem[] {
    const items = this.data.carts[sessionId] || [];
    return items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      product: this.getProductById(item.productId)
    })).filter(item => Boolean(item.product));
  }

  public addToCart(sessionId: string, productId: string, quantity: number = 1): CartItem[] {
    const product = this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    if (!this.data.carts[sessionId]) {
      this.data.carts[sessionId] = [];
    }

    const existingIndex = this.data.carts[sessionId].findIndex(i => i.productId === productId);
    if (existingIndex > -1) {
      this.data.carts[sessionId][existingIndex].quantity += quantity;
    } else {
      this.data.carts[sessionId].push({ productId, quantity });
    }

    this.saveData();
    return this.getCart(sessionId);
  }

  public updateCartItem(sessionId: string, productId: string, quantity: number): CartItem[] {
    if (!this.data.carts[sessionId]) {
      this.data.carts[sessionId] = [];
    }

    if (quantity <= 0) {
      this.data.carts[sessionId] = this.data.carts[sessionId].filter(i => i.productId !== productId);
    } else {
      const item = this.data.carts[sessionId].find(i => i.productId === productId);
      if (item) {
        item.quantity = quantity;
      } else {
        this.data.carts[sessionId].push({ productId, quantity });
      }
    }

    this.saveData();
    return this.getCart(sessionId);
  }

  public removeFromCart(sessionId: string, productId: string): CartItem[] {
    if (this.data.carts[sessionId]) {
      this.data.carts[sessionId] = this.data.carts[sessionId].filter(i => i.productId !== productId);
      this.saveData();
    }
    return this.getCart(sessionId);
  }

  public clearCart(sessionId: string) {
    this.data.carts[sessionId] = [];
    this.saveData();
  }

  // --- Orders ---
  public createOrder(payload: {
    userId?: string;
    sessionId?: string;
    userEmail: string;
    customerName: string;
    customerPhone: string;
    shippingAddress: UserAddress;
    paymentMethod: 'card' | 'cod' | 'apple_pay';
    promoDiscountPercent?: number;
    customItems?: { productId: string; quantity: number }[];
  }): Order {
    const orderItems: { productId: string; name: string; price: number; quantity: number; image: string }[] = [];
    let itemsToProcess = payload.customItems;

    if (!itemsToProcess || itemsToProcess.length === 0) {
      const activeSession = payload.userId || payload.sessionId || '';
      itemsToProcess = this.data.carts[activeSession] || [];
    }

    if (!itemsToProcess || itemsToProcess.length === 0) {
      throw new Error('Cannot create an order with an empty cart.');
    }

    let subtotal = 0;
    for (const item of itemsToProcess) {
      const product = this.getProductById(item.productId);
      if (!product) continue;

      if (product.stockCount < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.stockCount}`);
      }

      // Decrement stock
      product.stockCount -= item.quantity;
      if (product.stockCount <= 0) {
        product.inStock = false;
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    const discountRate = payload.promoDiscountPercent ? (payload.promoDiscountPercent / 100) : 0;
    const discount = Math.round(subtotal * discountRate * 100) / 100;
    const shippingFee = subtotal >= 150 ? 0 : 15;
    const taxableSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableSubtotal * 0.08 * 100) / 100; // 8% sales tax
    const total = Math.round((taxableSubtotal + shippingFee + tax) * 100) / 100;

    const orderId = `KB-${Math.floor(10000 + Math.random() * 90000)}`;
    const trackingCode = `TRK-${payload.shippingAddress.postalCode.slice(0, 3)}-${Date.now().toString().slice(-6)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const estimatedDelivery = deliveryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });

    const newOrder: Order = {
      id: orderId,
      userId: payload.userId,
      userEmail: payload.userEmail.toLowerCase().trim(),
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      shippingAddress: payload.shippingAddress,
      items: orderItems,
      subtotal,
      shippingFee,
      discount,
      tax,
      total,
      status: 'confirmed',
      paymentMethod: payload.paymentMethod,
      trackingCode,
      createdAt: new Date().toISOString(),
      estimatedDelivery: `Estimated delivery by ${estimatedDelivery}`
    };

    this.data.orders.unshift(newOrder);

    // Clear cart if session was provided
    if (payload.userId && this.data.carts[payload.userId]) {
      this.data.carts[payload.userId] = [];
    }
    if (payload.sessionId && this.data.carts[payload.sessionId]) {
      this.data.carts[payload.sessionId] = [];
    }

    this.saveData();
    return newOrder;
  }

  public getOrdersByUser(userId?: string, email?: string): Order[] {
    return this.data.orders.filter(order => {
      if (userId && order.userId === userId) return true;
      if (email && order.userEmail.toLowerCase() === email.toLowerCase()) return true;
      return false;
    });
  }

  public getOrderById(orderId: string): Order | undefined {
    return this.data.orders.find(o => o.id === orderId);
  }
}

export const db = new DatabaseManager();
