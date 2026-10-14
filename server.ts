import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Helper middleware to identify session & user
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const guestSession = (req.headers['x-session-id'] as string) || 'guest-session';

    (req as any).guestSession = guestSession;
    if (token) {
      const user = db.getUserByToken(token);
      (req as any).user = user;
      (req as any).token = token;
      (req as any).cartSessionId = user ? user.id : guestSession;
    } else {
      (req as any).cartSessionId = guestSession;
    }
    next();
  };

  app.use(authMiddleware);

  // --- API Routes ---

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, password, phone, address } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      const { user, token } = db.registerUser(name, email, password, phone, address);
      res.status(201).json({ user, token });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Registration failed.' });
    }
  });

  // Auth: Login
  app.post('/api/auth/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }
      const { user, token } = db.loginUser(email, password);
      res.json({ user, token });
    } catch (err: any) {
      res.status(401).json({ error: err.message || 'Login failed.' });
    }
  });

  // Auth: Current User
  app.get('/api/auth/me', (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({ user });
  });

  // Auth: Profile Update
  app.put('/api/auth/profile', (req, res) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    try {
      const updated = db.updateUserProfile(user.id, req.body);
      res.json({ user: updated });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Profile update failed.' });
    }
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req, res) => {
    const token = (req as any).token;
    if (token) {
      db.logoutUser(token);
    }
    res.json({ success: true });
  });

  // Products: List
  app.get('/api/products', (req, res) => {
    const { category, search, sort, minPrice, maxPrice } = req.query;
    const products = db.getProducts({
      category: category as string,
      search: search as string,
      sort: sort as string,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
    });
    res.json({ products, total: products.length });
  });

  // Products: Single Detail
  app.get('/api/products/:id', (req, res) => {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  });

  // Products: Add Review
  app.post('/api/products/:id/reviews', (req, res) => {
    const { author, rating, comment } = req.body;
    if (!author || !rating || !comment) {
      return res.status(400).json({ error: 'Author, rating, and comment are required.' });
    }
    const updated = db.addProductReview(req.params.id, {
      author,
      rating: Number(rating),
      comment
    });
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product: updated });
  });

  // Cart: Get Cart
  app.get('/api/cart', (req, res) => {
    const sessionId = (req as any).cartSessionId;
    const items = db.getCart(sessionId);
    res.json({ items });
  });

  // Cart: Add Item
  app.post('/api/cart', (req, res) => {
    const sessionId = (req as any).cartSessionId;
    const { productId, quantity } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required.' });
    }
    try {
      const items = db.addToCart(sessionId, productId, quantity || 1);
      res.json({ items });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // Cart: Update Item Quantity
  app.put('/api/cart/:productId', (req, res) => {
    const sessionId = (req as any).cartSessionId;
    const { quantity } = req.body;
    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Numeric quantity is required.' });
    }
    const items = db.updateCartItem(sessionId, req.params.productId, quantity);
    res.json({ items });
  });

  // Cart: Remove Item
  app.delete('/api/cart/:productId', (req, res) => {
    const sessionId = (req as any).cartSessionId;
    const items = db.removeFromCart(sessionId, req.params.productId);
    res.json({ items });
  });

  // Cart: Clear
  app.delete('/api/cart', (req, res) => {
    const sessionId = (req as any).cartSessionId;
    db.clearCart(sessionId);
    res.json({ items: [] });
  });

  // Orders: Create Order
  app.post('/api/orders', (req, res) => {
    try {
      const user = (req as any).user;
      const sessionId = (req as any).cartSessionId;
      const {
        customerName,
        userEmail,
        customerPhone,
        shippingAddress,
        paymentMethod,
        promoDiscountPercent,
        customItems
      } = req.body;

      if (!customerName || !userEmail || !customerPhone || !shippingAddress) {
        return res.status(400).json({ error: 'All contact and shipping fields are required.' });
      }

      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
        return res.status(400).json({ error: 'Complete street, city, and postal code are required.' });
      }

      const order = db.createOrder({
        userId: user?.id,
        sessionId,
        userEmail,
        customerName,
        customerPhone,
        shippingAddress,
        paymentMethod: paymentMethod || 'card',
        promoDiscountPercent: Number(promoDiscountPercent) || 0,
        customItems
      });

      res.status(201).json({ order });
    } catch (err: any) {
      res.status(400).json({ error: err.message || 'Failed to process order.' });
    }
  });

  // Orders: List User Orders
  app.get('/api/orders', (req, res) => {
    const user = (req as any).user;
    const email = (req.query.email as string) || (user ? user.email : undefined);
    const orders = db.getOrdersByUser(user?.id, email);
    res.json({ orders });
  });

  // Orders: Single Detail
  app.get('/api/orders/:id', (req, res) => {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ order });
  });

  // --- Vite Dev Server Middleware or Static Production ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
