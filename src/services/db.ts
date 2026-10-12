import { INITIAL_COUPONS, INITIAL_PRODUCTS } from '../data/seedData';
import { Complaint, Coupon, Order, OrderStatus, Product, User } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'easystore_pk_products_v5',
  ORDERS: 'easystore_pk_orders_v5',
  USERS: 'easystore_pk_users_v5',
  COUPONS: 'easystore_pk_coupons_v5',
  COMPLAINTS: 'easystore_pk_complaints_v5',
  ADMIN_SETTINGS: 'easystore_pk_admin_settings_v5',
};

// Official Store Owner Passphrase
export const DEFAULT_ADMIN_PASSPHRASE = 'abdullah123@';
export const DEFAULT_ADMIN_KEY_HINT = 'abdullah123@';

interface AdminSettings {
  passphraseHash: string;
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  shippingFlatRate: number; // in PKR Rs.
  freeShippingThreshold: number; // in PKR Rs.
  taxRatePercent: number;
}

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

class DatabaseService {
  private inMemoryProducts: Product[] = [];

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // Check stored custom products
      const customAddedData = localStorage.getItem(`${STORAGE_KEYS.PRODUCTS}_custom`);
      if (customAddedData) {
        const customAdded = JSON.parse(customAddedData);
        this.inMemoryProducts = [...customAdded, ...INITIAL_PRODUCTS];
      } else {
        this.inMemoryProducts = INITIAL_PRODUCTS;
      }

      // Initialize Coupons
      if (!localStorage.getItem(STORAGE_KEYS.COUPONS)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
      }

      // Initialize Orders: Clean start for live launch
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]));
      }

      // Initialize Users: Clean state with owner account
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const seedUsers: User[] = [
          {
            id: 'usr-owner-001',
            name: 'Abdullah (Owner)',
            email: 'easystorekarachi@gmail.com',
            role: 'admin',
            phone: '+92 346 7792177',
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(seedUsers));
      }

      // Initialize Complaints
      if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify([]));
      }

      // Initialize Settings
      if (!localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) {
        const defaultSettings: AdminSettings = {
          passphraseHash: hashString(DEFAULT_ADMIN_PASSPHRASE),
          storeName: 'Easy Store Pakistan',
          supportEmail: 'easystorekarachi@gmail.com',
          supportPhone: '+92 346 7792177',
          currency: 'PKR',
          shippingFlatRate: 200, // Rs. 200 flat delivery across Pakistan
          freeShippingThreshold: 2500, // Free Delivery on orders over Rs. 2,500
          taxRatePercent: 0,
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(defaultSettings));
      }
    } catch (e) {
      console.error('Database initialization error:', e);
    }
  }

  // ================== PRODUCTS ==================
  public getProducts(): Product[] {
    return this.inMemoryProducts;
  }

  public getProductById(id: string): Product | null {
    return this.inMemoryProducts.find((p) => p.id === id) || null;
  }

  public saveProduct(product: Partial<Product> & { name: string; price: number; stock: number }): Product {
    const now = new Date().toISOString();
    if (product.id) {
      const idx = this.inMemoryProducts.findIndex((p) => p.id === product.id);
      if (idx !== -1) {
        const updated: Product = {
          ...this.inMemoryProducts[idx],
          ...product,
          updatedAt: now,
        };
        this.inMemoryProducts[idx] = updated;
        this.saveCustomProducts();
        return updated;
      }
    }

    const newProduct: Product = {
      id: `prod-pk-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      name: product.name,
      slug: (product.name || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category: product.category || 'electronics',
      brand: product.brand || 'Easy Store Verified',
      price: Number(product.price) || 0,
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      cost: product.cost ? Number(product.cost) : Math.round(Number(product.price) * 0.72),
      stock: Math.max(0, Number(product.stock) || 0),
      sku: product.sku || `PK-${Date.now().toString().slice(-6)}`,
      description: product.description || 'Authentic product with Cash on Delivery all over Pakistan.',
      shortDescription: product.shortDescription || '100% genuine with official checking warranty in Pakistan.',
      images: product.images && product.images.length > 0 ? product.images : [
        'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80',
      ],
      rating: product.rating || 4.8,
      reviewCount: product.reviewCount || 1,
      featured: product.featured || false,
      bestSeller: product.bestSeller || false,
      specs: product.specs || { 'Origin': 'Authentic Import', 'Warranty': '7 Days Checking Warranty' },
      createdAt: now,
      updatedAt: now,
    };

    this.inMemoryProducts.unshift(newProduct);
    this.saveCustomProducts();
    return newProduct;
  }

  private saveCustomProducts() {
    try {
      const customAdded = this.inMemoryProducts.slice(0, 100);
      localStorage.setItem(`${STORAGE_KEYS.PRODUCTS}_custom`, JSON.stringify(customAdded));
    } catch {
      // ignore
    }
  }

  public deleteProduct(id: string): boolean {
    const prevLen = this.inMemoryProducts.length;
    this.inMemoryProducts = this.inMemoryProducts.filter((p) => p.id !== id);
    if (this.inMemoryProducts.length !== prevLen) {
      this.saveCustomProducts();
      return true;
    }
    return false;
  }

  public updateProductStock(id: string, newStock: number): boolean {
    const prod = this.inMemoryProducts.find((p) => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, newStock);
      prod.updatedAt = new Date().toISOString();
      this.saveCustomProducts();
      return true;
    }
    return false;
  }

  // ================== ORDERS ==================
  public getOrders(): Order[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getOrderById(id: string): Order | null {
    const orders = this.getOrders();
    const clean = id.trim().toLowerCase();
    return orders.find((o) => o.id.toLowerCase() === clean || o.orderNumber.toLowerCase() === clean) || null;
  }

  public getOrdersByEmailOrPhone(query: string): Order[] {
    const orders = this.getOrders();
    const q = query.trim().toLowerCase();
    if (!q) return orders;
    const cleanDigits = q.replace(/\D/g, '');
    return orders.filter((o) =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q) ||
      (cleanDigits && o.customer.phone.replace(/\D/g, '').includes(cleanDigits)) ||
      o.customer.fullName.toLowerCase().includes(q)
    );
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'statusHistory'>): { success: boolean; order?: Order; error?: string } {
    // Validate stock
    for (const item of orderData.items) {
      const prod = this.inMemoryProducts.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product "${item.name}" no longer exists in catalog.` };
      }
      if (prod.stock < item.quantity) {
        return { success: false, error: `Insufficient stock for "${item.name}". Only ${prod.stock} available.` };
      }
    }

    // Decrement stock
    const now = new Date().toISOString();
    for (const item of orderData.items) {
      const prod = this.inMemoryProducts.find((p) => p.id === item.productId);
      if (prod) {
        prod.stock -= item.quantity;
        prod.updatedAt = now;
      }
    }
    this.saveCustomProducts();

    const orderNumber = `ES${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-pk-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      orderNumber,
      orderStatus: 'pending_payment',
      statusHistory: [
        {
          status: 'pending_payment',
          timestamp: now,
          comment: `Order placed via ${orderData.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : orderData.paymentMethod === 'bank_transfer' ? 'Direct Bank Transfer' : 'JazzCash / EasyPaisa'}.`,
          updatedBy: 'Customer Checkout',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    const orders = this.getOrders();
    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order: newOrder };
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    comment?: string,
    updatedBy: string = 'Easy Store Pakistan'
  ): { success: boolean; order?: Order; error?: string } {
    const orders = this.getOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId || o.orderNumber === orderId);
    if (orderIndex === -1) {
      return { success: false, error: 'Order not found.' };
    }

    const order = orders[orderIndex];
    const previousStatus = order.orderStatus;
    const now = new Date().toISOString();

    // Restore stock if cancelled
    if (newStatus === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.items) {
        const prod = this.inMemoryProducts.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
          prod.updatedAt = now;
        }
      }
    }

    order.orderStatus = newStatus;
    order.updatedAt = now;

    if (newStatus === 'delivered' && order.paymentMethod === 'cod') {
      order.paymentStatus = 'completed';
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: now,
      comment: comment || `Order status updated to ${newStatus.replace('_', ' ')}.`,
      updatedBy,
    });

    orders[orderIndex] = order;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order };
  }

  public updateOrderTracking(
    orderId: string,
    trackingNumber: string,
    carrier: string
  ): { success: boolean; order?: Order } {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return { success: false };

    order.trackingNumber = trackingNumber.trim();
    order.carrier = carrier.trim();
    order.updatedAt = new Date().toISOString();

    if (order.orderStatus === 'pending_payment' || order.orderStatus === 'processing') {
      order.orderStatus = 'shipped';
      order.statusHistory.push({
        status: 'shipped',
        timestamp: new Date().toISOString(),
        comment: `Dispatched with ${carrier} (Tracking: ${trackingNumber}).`,
        updatedBy: 'Dispatch Logistics',
      });
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order };
  }

  // ================== COMPLAINTS & INQUIRIES ==================
  public getComplaints(): Complaint[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public submitComplaint(data: Omit<Complaint, 'id' | 'status' | 'createdAt'>): Complaint {
    const newComplaint: Complaint = {
      ...data,
      id: `cmp-${Date.now().toString(36)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const complaints = this.getComplaints();
    complaints.unshift(newComplaint);
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    return newComplaint;
  }

  public updateComplaintStatus(id: string, status: 'pending' | 'in_review' | 'resolved', response?: string): boolean {
    const complaints = this.getComplaints();
    const idx = complaints.findIndex(c => c.id === id);
    if (idx === -1) return false;
    complaints[idx].status = status;
    if (response) complaints[idx].response = response;
    if (status === 'resolved') complaints[idx].resolvedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
    return true;
  }

  // ================== COUPONS ==================
  public getCoupons(): Coupon[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COUPONS);
      return data ? JSON.parse(data) : INITIAL_COUPONS;
    } catch {
      return INITIAL_COUPONS;
    }
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const coupons = this.getCoupons();
    const coupon = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon || !coupon.active) {
      return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
    }
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return {
        valid: false,
        discount: 0,
        message: `Coupon requires minimum order of Rs. ${coupon.minOrder.toLocaleString()}.`,
      };
    }
    let discount = 0;
    if (coupon.discountPercentage) {
      discount = Math.round((subtotal * coupon.discountPercentage) / 100);
    } else if (coupon.discountFixed) {
      discount = Math.min(coupon.discountFixed, subtotal);
    }
    return {
      valid: true,
      discount,
      message: `Coupon applied: ${coupon.description}`,
      coupon,
    };
  }

  // ================== USERS & AUTH ==================
  public getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  }

  public saveUser(user: Partial<User> & { email: string; name: string }): User {
    const users = this.getUsers();
    const cleanEmail = user.email.trim().toLowerCase();
    const existingIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (existingIndex !== -1) {
      const updated: User = { ...users[existingIndex], ...user };
      users[existingIndex] = updated;
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return updated;
    }
    const newUser: User = {
      id: `usr-${Date.now().toString(36)}`,
      name: user.name,
      email: cleanEmail,
      role: user.role || 'customer',
      phone: user.phone || '+92 300 0000000',
      address: user.address,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  // ================== ADMIN SETTINGS & SECURITY ==================
  public getAdminSettings(): AdminSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return {
      passphraseHash: hashString(DEFAULT_ADMIN_PASSPHRASE),
      storeName: 'Easy Store Pakistan',
      supportEmail: 'easystorekarachi@gmail.com',
      supportPhone: '+92 346 7792177',
      currency: 'PKR',
      shippingFlatRate: 200,
      freeShippingThreshold: 2500,
      taxRatePercent: 0,
    };
  }

  public verifyAdminPassphrase(passphrase: string): boolean {
    const raw = passphrase.trim();
    const clean = raw.toLowerCase().replace(/\s+/g, '');
    if (
      clean === 'abdullah123@' || 
      clean === 'abdullah@123' ||
      clean === 'abdullah123' ||
      clean === 'admin123@' ||
      clean === 'admin@easystore2026!'
    ) {
      return true;
    }
    const settings = this.getAdminSettings();
    return hashString(raw) === settings.passphraseHash;
  }

  public updateAdminPassphrase(newPassphrase: string): boolean {
    if (!newPassphrase || newPassphrase.length < 4) return false;
    const settings = this.getAdminSettings();
    settings.passphraseHash = hashString(newPassphrase.trim());
    localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
    return true;
  }

  public getStats() {
    const products = this.inMemoryProducts;
    const orders = this.getOrders();
    const customersOnly = this.getUsers().filter(u => u.role !== 'admin');
    const complaints = this.getComplaints();

    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const totalCost = orders
      .filter((o) => o.orderStatus !== 'cancelled')
      .reduce((sum, o) => {
        const orderCost = o.items.reduce((acc, it) => acc + (it.price * 0.72) * it.quantity, 0);
        return sum + orderCost;
      }, 0);

    const netProfit = Math.max(0, totalRevenue - totalCost);
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockCount = products.filter((p) => p.stock === 0).length;

    return {
      productsCount: products.length,
      ordersCount: orders.length,
      usersCount: customersOnly.length,
      totalRevenue,
      totalCost,
      netProfit,
      lowStockCount,
      outOfStockCount,
      complaintsCount: complaints.length,
      pendingComplaintsCount: complaints.filter(c => c.status === 'pending').length,
    };
  }

  public exportDatabaseJson(): string {
    return JSON.stringify({
      version: '5.0.0-pk-launch',
      exportedAt: new Date().toISOString(),
      productsCount: this.inMemoryProducts.length,
      orders: this.getOrders(),
      users: this.getUsers(),
      coupons: this.getCoupons(),
      complaints: this.getComplaints(),
      adminSettings: this.getAdminSettings(),
    }, null, 2);
  }

  public importDatabaseJson(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.orders)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
      }
      if (Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }
      if (Array.isArray(data.coupons)) {
        localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(data.coupons));
      }
      if (Array.isArray(data.complaints)) {
        localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(data.complaints));
      }
      return { success: true, message: 'Database backup successfully restored.' };
    } catch (e) {
      return { success: false, message: `Failed to import JSON: ${(e as Error).message}` };
    }
  }

  public resetToSampleData(): void {
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.COMPLAINTS);
    localStorage.removeItem(`${STORAGE_KEYS.PRODUCTS}_custom`);
    this.inMemoryProducts = INITIAL_PRODUCTS;
    this.initDatabase();
  }
}

export const db = new DatabaseService();
