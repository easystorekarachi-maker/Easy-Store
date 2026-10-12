import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LayoutGrid, 
  Tag, 
  Ticket, 
  BarChart2, 
  Megaphone, 
  FileText, 
  Image as ImageIcon, 
  Settings, 
  Globe, 
  ExternalLink,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Calendar,
  Zap,
  Plus,
  Edit3,
  Trash2,
  Lock,
  Headphones,
  CheckCircle2,
  Clock,
  RotateCcw,
  Download,
  Upload,
  Key,
  X,
  Database,
  Send,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/db';
import { getIntegrationStatus, getCredentialRequirements } from '../services/integrations';
import { CATEGORIES } from '../data/seedData';
import { Order, OrderStatus, Product, ProductCategory, StoreViewMode, User, Coupon, Complaint } from '../types';
import { OwnerAvatar } from '../components/OwnerAvatar';

interface AdminPortalViewProps {
  onNavigate: (view: StoreViewMode) => void;
  onRefreshCatalog: () => void;
}

type AdminTab = 
  | 'dashboard'
  | 'products'
  | 'orders'
  | 'customers'
  | 'complaints'
  | 'categories'
  | 'brands'
  | 'coupons'
  | 'reports'
  | 'marketing'
  | 'content_pages'
  | 'banner_management'
  | 'settings';

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  onNavigate,
  onRefreshCatalog,
}) => {
  const { isAdminUnlocked, lockAdminGate, setShowAdminGateModal } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('pending_payment');
  const [statusComment, setStatusComment] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('TCS Express Pakistan');

  // Customers state
  const [customers, setCustomers] = useState<User[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Complaints state
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [complaintFilter, setComplaintFilter] = useState<'all' | 'pending' | 'in_review' | 'resolved'>('all');
  const [complaintResponses, setComplaintResponses] = useState<{ [id: string]: string }>({});

  // Marketing broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('Salam! Exclusive Weekend Sale on Easy Store. Enjoy up to 40% OFF with code EASYSTORE.');
  const [broadcastTarget, setBroadcastTarget] = useState('all');

  // Security passphrase state
  const [newPassphrase, setNewPassphrase] = useState('');

  // JSON import input
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  // Chart range selector
  const [salesTimeframe, setSalesTimeframe] = useState<'7days' | '30days' | 'month' | 'year'>('7days');

  // Load data
  const loadData = () => {
    setProducts(db.getProducts());
    setOrders(db.getOrders());
    setCustomers(db.getUsers());
    setCoupons(db.getCoupons());
    setComplaints(db.getComplaints());
  };

  const handleUpdateComplaintStatus = (id: string, status: 'pending' | 'in_review' | 'resolved') => {
    const reply = complaintResponses[id] || '';
    db.updateComplaintStatus(id, status, reply.trim() || undefined);
    showToast('Complaint Status Updated', `Status changed to ${status.replace('_', ' ')}.`, 'success');
    loadData();
  };

  useEffect(() => {
    if (isAdminUnlocked) {
      loadData();
    }
  }, [isAdminUnlocked]);

  // Stats
  const stats = db.getStats();
  const integrations = getIntegrationStatus(stats);
  const credentialRequirements = getCredentialRequirements();

  // If locked, render security gate prompt
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 text-[#0284c7] flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#0f3460]">Administrator Access Locked</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Easy Store admin dashboard is protected by security passkey verification to safeguard store catalog and customer data.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => setShowAdminGateModal(true)}
              className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-sky-500/20 cursor-pointer"
            >
              Enter Admin Passphrase
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Return to Public Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered products
  const filteredProducts = products.filter((p) => {
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter === 'all') return true;
    return o.orderStatus === orderStatusFilter;
  });

  // Filtered customers
  const filteredCustomers = customers.filter((c) => {
    if (!customerSearch.trim()) return true;
    const q = customerSearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
  });

  // KPI Calculations
  const totalSalesAmount = stats.totalRevenue;
  const totalOrdersCount = orders.length;
  const totalCustomersCount = customers.filter(c => c.role !== 'admin').length;
  const totalProductsCount = products.length;
  const netProfitAmount = stats.netProfit;

  // Order status counts for donut chart
  const completedOrdersCount = orders.filter(o => o.orderStatus === 'delivered').length;
  const processingOrdersCount = orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'shipped').length;
  const pendingOrdersCount = orders.filter(o => o.orderStatus === 'pending_payment').length;
  const cancelledOrdersCount = orders.filter(o => o.orderStatus === 'cancelled').length;
  const donutTotal = orders.length;

  // Top Selling Products
  const topSellingProducts = [
    {
      id: 'prod-ip15pm',
      name: 'iPhone 15 Pro Max 256GB',
      sold: 256,
      growth: '+24%',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-galaxy-watch7',
      name: 'Samsung Galaxy Watch 7',
      sold: 189,
      growth: '+18%',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-hp-15-laptop',
      name: 'HP 15 Laptop 13th Gen',
      sold: 154,
      growth: '+16%',
      image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-jbl-tune710bt',
      name: 'JBL Tune 710BT Headphones',
      sold: 142,
      growth: '+12%',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'prod-canon-2000d',
      name: 'Canon EOS 2000D II',
      sold: 118,
      growth: '+10%',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=200&q=80',
    },
  ];

  // Brand data
  const brandsList = [
    { name: 'Apple', productsCount: 142, origin: 'USA', status: 'Official Mercantile' },
    { name: 'Samsung', productsCount: 184, origin: 'South Korea', status: 'Samsung Pakistan' },
    { name: 'HP', productsCount: 96, origin: 'USA', status: 'Official Distributor' },
    { name: 'JBL', productsCount: 68, origin: 'USA', status: 'Harman Official' },
    { name: 'Canon', productsCount: 42, origin: 'Japan', status: 'Shirazi Trading' },
    { name: 'Xiaomi', productsCount: 118, origin: 'China', status: 'Smart Link Technologies' },
    { name: 'Nike', productsCount: 88, origin: 'USA', status: 'Authentic Import' },
    { name: 'Sony', productsCount: 76, origin: 'Japan', status: 'Sony Pakistan' },
  ];

  // Handlers for Products
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || editingProduct.price === undefined) {
      showToast('Validation Error', 'Product title and price are required.', 'error');
      return;
    }
    db.saveProduct({
      id: editingProduct.id,
      name: editingProduct.name,
      category: (editingProduct.category as ProductCategory) || 'mobiles-tablets',
      price: Number(editingProduct.price) || 0,
      compareAtPrice: editingProduct.compareAtPrice ? Number(editingProduct.compareAtPrice) : undefined,
      cost: editingProduct.cost ? Number(editingProduct.cost) : undefined,
      stock: Math.max(0, Number(editingProduct.stock) || 0),
      sku: editingProduct.sku || `SKU-${Date.now().toString().slice(-6)}`,
      description: editingProduct.description || 'Verified product from Easy Store Pakistan.',
      shortDescription: editingProduct.shortDescription || '100% Genuine with official warranty in Pakistan.',
      images: editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [
        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      ],
      rating: editingProduct.rating || 5.0,
      reviewCount: editingProduct.reviewCount || 1,
      specs: editingProduct.specs || { 'Origin': 'Original Import', 'Warranty': 'Official Brand Warranty' },
    });
    setIsProductModalOpen(false);
    setEditingProduct(null);
    loadData();
    onRefreshCatalog();
    showToast('Catalog Updated', 'Product record saved successfully.', 'success');
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from store catalog?`)) {
      db.deleteProduct(id);
      loadData();
      onRefreshCatalog();
      showToast('Deleted', `"${name}" removed from catalog.`, 'info');
    }
  };

  const handleQuickStockAdjust = (id: string, delta: number) => {
    const prod = products.find((p) => p.id === id);
    if (!prod) return;
    const nextStock = Math.max(0, prod.stock + delta);
    db.updateProductStock(id, nextStock);
    loadData();
    onRefreshCatalog();
  };

  // Handlers for Orders
  const handleOpenOrderInspect = (order: Order) => {
    setInspectedOrder(order);
    setNewOrderStatus(order.orderStatus);
    setStatusComment('');
    setTrackingNumber(order.trackingNumber || '');
    setCarrier(order.carrier || 'TCS Express Pakistan');
  };

  const handleUpdateOrderStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedOrder) return;
    const res = db.updateOrderStatus(
      inspectedOrder.id,
      newOrderStatus,
      statusComment.trim() || undefined,
      'Store Administrator'
    );
    if (trackingNumber.trim()) {
      db.updateOrderTracking(inspectedOrder.id, trackingNumber.trim(), carrier);
    }
    if (res.success && res.order) {
      setInspectedOrder(res.order);
      loadData();
      onRefreshCatalog();
      showToast('Order Updated', `Status updated to ${newOrderStatus.replace('_', ' ')}.`, 'success');
    } else {
      showToast('Error', res.error || 'Failed to update order.', 'error');
    }
  };

  // Handlers for Database Backup & Restore
  const handleExportJson = () => {
    const jsonStr = db.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easystore-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup Generated', 'JSON database backup downloaded.', 'success');
  };

  const handleImportJson = (e: React.FormEvent) => {
    e.preventDefault();
    const res = db.importDatabaseJson(importJsonText);
    if (res.success) {
      setShowImportModal(false);
      setImportJsonText('');
      loadData();
      onRefreshCatalog();
      showToast('Restore Successful', res.message, 'success');
    } else {
      showToast('Restore Failed', res.message, 'error');
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm('Reset catalog, orders, and inventory to initial seed data?')) {
      db.resetToSampleData();
      loadData();
      onRefreshCatalog();
      showToast('Catalog Reset', 'Default store inventory restored.', 'info');
    }
  };

  const handleChangePassphrase = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassphrase.length < 6) {
      showToast('Error', 'Passphrase must be at least 6 characters long.', 'error');
      return;
    }
    const ok = db.updateAdminPassphrase(newPassphrase);
    if (ok) {
      setNewPassphrase('');
      showToast('Security Updated', 'Master admin passphrase changed successfully.', 'success');
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newCoupon: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      discountPercentage: newCouponDiscount,
      description: newCouponDesc.trim() || `${newCouponDiscount}% Off Storewide`,
      active: true,
      minOrder: 1000,
    };
    const updated = [...coupons, newCoupon];
    setCoupons(updated);
    localStorage.setItem('easystore_pk_coupons_v5', JSON.stringify(updated));
    setNewCouponCode('');
    setNewCouponDesc('');
    showToast('Coupon Created', `Code ${newCoupon.code} is now active!`, 'success');
  };

  const navMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: orders.length > 0 ? orders.length : undefined },
    { id: 'customers', label: 'Customers', icon: Users, badge: customers.filter(c => c.role !== 'admin').length > 0 ? customers.filter(c => c.role !== 'admin').length : undefined },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare, badge: complaints.filter(c => c.status === 'pending').length > 0 ? complaints.filter(c => c.status === 'pending').length : undefined },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'brands', label: 'Brands', icon: Tag },
    { id: 'coupons', label: 'Coupons', icon: Ticket },
    { id: 'reports', label: 'Reports & Profit', icon: BarChart2 },
    { id: 'marketing', label: 'Marketing', icon: Megaphone },
    { id: 'content_pages', label: 'Content Pages', icon: FileText },
    { id: 'banner_management', label: 'Banner Management', icon: ImageIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col antialiased">
      {/* TOP NAVBAR */}
      <header className="bg-[#0284c7] text-white sticky top-0 z-40 shadow-sm border-b border-[#0369a1]">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-white hover:bg-[#0369a1] transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white border border-white/20 shadow-xs group-hover:scale-105 transition-transform">
                <ShoppingCart className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black tracking-tight text-white leading-none">
                  Easy Store Admin
                </h1>
                <p className="text-[11px] font-medium text-sky-100 tracking-tight mt-0.5">
                  Har Cheez Asaan, Har Ghar Tak
                </p>
              </div>
            </button>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative">
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search orders, products, customers..."
                className="w-full bg-[#0369a1]/70 border border-sky-400/40 rounded-full py-2 pl-10 pr-4 text-xs sm:text-sm text-white placeholder-sky-200/80 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-[#0369a1] transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-sky-200 absolute left-3.5 top-2.5 sm:top-3" />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 top-2.5 text-sky-200 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Notifications, Settings, Profile */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {pendingOrdersCount + complaints.filter(c => c.status === 'pending').length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {pendingOrdersCount + complaints.filter(c => c.status === 'pending').length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 p-3 z-50 animate-in fade-in text-xs"
                  onMouseLeave={() => setNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 font-bold text-slate-800">
                    <span>Recent Notifications</span>
                    <span className="text-[10px] text-slate-400">
                      {pendingOrdersCount + complaints.filter(c => c.status === 'pending').length} unread
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 mt-1 max-h-64 overflow-y-auto">
                    {pendingOrdersCount + complaints.filter(c => c.status === 'pending').length === 0 ? (
                      <div className="py-6 text-center text-slate-400 text-xs">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                        <p className="font-semibold text-slate-700">No new notifications</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">All customer orders and tickets are up to date.</p>
                      </div>
                    ) : (
                      <>
                        {pendingOrdersCount > 0 && (
                          <div className="py-2 flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">{pendingOrdersCount} Order(s) Awaiting Dispatch</p>
                              <p className="text-[10px] text-slate-500">Check Orders tab to verify fulfillment</p>
                            </div>
                          </div>
                        )}
                        {complaints.filter(c => c.status === 'pending').length > 0 && (
                          <div className="py-2 flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-800">{complaints.filter(c => c.status === 'pending').length} Customer Complaint(s)</p>
                              <p className="text-[10px] text-slate-500">Pending review in Complaints tab</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Settings Icon */}
            <button
              onClick={() => setActiveTab('settings')}
              className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center text-white transition-colors cursor-pointer"
              title="Store Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Store Owner Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 hover:bg-white/10 px-2 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                <OwnerAvatar size="md" className="ring-2 ring-white/80 shadow-xs" />
                <div className="hidden md:block text-left leading-tight">
                  <p className="text-xs font-bold text-white flex items-center gap-1">
                    <span>Abdullah</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-300 inline" />
                  </p>
                  <p className="text-[10px] text-sky-200">Founder &amp; Super Admin</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-sky-200 hidden sm:block" />
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 py-2 z-50 animate-in fade-in text-xs font-medium"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60 rounded-t-2xl">
                    <OwnerAvatar size="lg" className="ring-2 ring-[#0284c7]" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Abdullah</p>
                      <p className="text-[11px] text-slate-500 truncate">easystorekarachi@gmail.com</p>
                      <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Verified Store Owner
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('catalog');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    Visit Public Store
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    System Settings
                  </button>
                  <button
                    onClick={() => {
                      lockAdminGate();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100 font-semibold"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Lock Admin Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside
          className={`bg-[#0284c7] text-white w-64 shrink-0 flex flex-col justify-between transition-all duration-300 z-30 ${
            mobileSidebarOpen ? 'fixed inset-y-0 left-0 pt-16 z-50 shadow-2xl block' : 'hidden lg:flex'
          }`}
        >
          {/* Navigation Links */}
          <div className="py-4 px-3 space-y-1 overflow-y-auto">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as AdminTab);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#0284c7] shadow-sm font-bold scale-[1.01]'
                      : 'text-white/95 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284c7]' : 'text-white'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Website View */}
            <button
              onClick={() => onNavigate('catalog')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white/95 hover:bg-white/10 hover:text-white transition-all cursor-pointer mt-2 pt-3 border-t border-white/15"
            >
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-white" />
                <span>Website View</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>

          {/* Bottom of Sidebar */}
          <div className="p-3 border-t border-white/15 space-y-3">
            <div className="bg-[#0369a1] border border-sky-400/30 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white">Support Center</p>
                <p className="text-[10px] text-sky-100 font-mono mt-0.5 truncate">easystorekarachi@gmail.com</p>
              </div>
            </div>
            <p className="text-[10px] text-center text-sky-200/80 font-medium">
              © 2026 Easy Store. All rights reserved.
            </p>
          </div>
        </aside>

        {/* Mobile Sidebar Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Dashboard Sub-Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-100 text-[#0284c7] flex items-center justify-center shadow-xs">
                    <LayoutDashboard className="w-5 h-5 stroke-[2.3]" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0f3460] tracking-tight">
                      Store Dashboard
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Welcome back, Abdullah! Here&apos;s your live store overview.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 flex items-center gap-2 shadow-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Live Store System</span>
                  </div>
                  <button
                    onClick={() => onNavigate('catalog')}
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    <span>Visit Store</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 5 TOP KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Total Orders */}
                <div 
                  onClick={() => setActiveTab('orders')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Orders</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {totalOrdersCount}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {totalOrdersCount === 0 ? 'Ready for live orders' : `${totalOrdersCount} orders placed`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Total Sales */}
                <div 
                  onClick={() => setActiveTab('reports')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                      <span className="text-lg font-black font-mono">Rs</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Sales</p>
                      <h3 className="text-xl font-black text-[#0f3460] font-mono mt-0.5">
                        Rs. {totalSalesAmount.toLocaleString()}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {totalSalesAmount === 0 ? 'Rs. 0 (Ready for launch)' : 'Gross sales revenue'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Net Profit */}
                <div 
                  onClick={() => setActiveTab('reports')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#06b6d4] text-white flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Net Profit</p>
                      <h3 className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                        Rs. {netProfitAmount.toLocaleString()}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {totalSalesAmount === 0 ? 'Rs. 0 profit' : `${Math.round((netProfitAmount / (totalSalesAmount || 1)) * 100)}% net margin`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Total Customers */}
                <div 
                  onClick={() => setActiveTab('customers')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#8b5cf6] text-white flex items-center justify-center shadow-md shadow-purple-500/20 group-hover:scale-105 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Customers</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {totalCustomersCount.toLocaleString()}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        {totalCustomersCount === 0 ? '0 registered buyers' : `${totalCustomersCount} active buyers`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Total Products */}
                <div 
                  onClick={() => setActiveTab('products')}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#f97316] text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500">Total Products</p>
                      <h3 className="text-2xl font-black text-[#0f3460] font-mono mt-0.5">
                        {totalProductsCount.toLocaleString()}
                      </h3>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Active catalog inventory
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: SALES OVERVIEW + ORDER STATUS + QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Sales Overview SVG Graph */}
                <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-[#0284c7]" />
                      <h3 className="font-bold text-sm text-[#0f3460]">Sales Overview</h3>
                    </div>
                    <select
                      value={salesTimeframe}
                      onChange={(e) => setSalesTimeframe(e.target.value as any)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 font-semibold cursor-pointer focus:outline-none"
                    >
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>

                  <div className="py-4">
                    <div className="relative h-48 w-full">
                      <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <line x1="40" y1="20" x2="490" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="40" y1="65" x2="490" y2="65" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="40" y1="110" x2="490" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <line x1="40" y1="155" x2="490" y2="155" stroke="#f1f5f9" strokeDasharray="4 4" />
                        <text x="5" y="24" fontSize="10" fill="#94a3b8" fontFamily="monospace">200K</text>
                        <text x="5" y="69" fontSize="10" fill="#94a3b8" fontFamily="monospace">150K</text>
                        <text x="5" y="114" fontSize="10" fill="#94a3b8" fontFamily="monospace">100K</text>
                        <text x="12" y="159" fontSize="10" fill="#94a3b8" fontFamily="monospace">50K</text>
                        <text x="25" y="195" fontSize="10" fill="#94a3b8" fontFamily="monospace">0</text>
                        <path
                          d="M 50 170 C 110 145, 140 155, 180 140 C 220 120, 260 135, 300 115 C 340 150, 380 125, 420 100 C 450 85, 470 60, 485 55 L 485 185 L 50 185 Z"
                          fill="url(#salesGradient)"
                        />
                        <path
                          d="M 50 170 C 110 145, 140 155, 180 140 C 220 120, 260 135, 300 115 C 340 150, 380 125, 420 100 C 450 85, 470 60, 485 55"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {[
                          { cx: 50, cy: 170, label: 'Day 1' },
                          { cx: 120, cy: 148, label: 'Day 2' },
                          { cx: 180, cy: 140, label: 'Day 3' },
                          { cx: 250, cy: 125, label: 'Day 4' },
                          { cx: 320, cy: 145, label: 'Day 5' },
                          { cx: 400, cy: 105, label: 'Day 6' },
                          { cx: 485, cy: 55, label: 'Day 7' },
                        ].map((pt, idx) => (
                          <circle
                            key={idx}
                            cx={pt.cx}
                            cy={pt.cy}
                            r="5"
                            fill="#0284c7"
                            stroke="#ffffff"
                            strokeWidth="2.5"
                          />
                        ))}
                        <text x="40" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 1</text>
                        <text x="110" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 2</text>
                        <text x="170" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 3</text>
                        <text x="240" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 4</text>
                        <text x="310" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 5</text>
                        <text x="385" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 6</text>
                        <text x="465" y="198" fontSize="10" fill="#64748b" fontWeight="600">Day 7</text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 2. Order Status Donut Chart */}
                <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="pb-3 border-b border-slate-100">
                    <h3 className="font-bold text-sm text-[#0f3460]">Order Status Breakdown</h3>
                  </div>

                  <div className="py-2 flex items-center justify-between gap-4">
                    <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#0284c7"
                          strokeWidth="14"
                          strokeDasharray="153 238"
                          strokeDashoffset="0"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="14"
                          strokeDasharray="40 238"
                          strokeDashoffset="-153"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="14"
                          strokeDasharray="28 238"
                          strokeDashoffset="-193"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="38"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="14"
                          strokeDasharray="17 238"
                          strokeDashoffset="-221"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-black text-[#0f3460] font-mono leading-none">
                          {donutTotal}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                          Total Orders
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                          <span className="font-semibold text-slate-700">Completed</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono">
                          {completedOrdersCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                          <span className="font-semibold text-slate-700">Processing</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono">
                          {processingOrdersCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                          <span className="font-semibold text-slate-700">Pending</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono">
                          {pendingOrdersCount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                          <span className="font-semibold text-slate-700">Cancelled</span>
                        </div>
                        <span className="font-bold text-slate-800 font-mono">
                          {cancelledOrdersCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Quick Actions */}
                <div className="lg:col-span-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="pb-3 border-b border-slate-100 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#0284c7]" />
                    <h3 className="font-bold text-sm text-[#0f3460]">Quick Actions</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 py-1">
                    <button
                      onClick={() => {
                        setEditingProduct({
                          category: 'mobiles-tablets',
                          stock: 20,
                          price: 4999,
                          images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
                        });
                        setIsProductModalOpen(true);
                      }}
                      className="p-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <Package className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="p-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Manage Orders</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('categories')}
                      className="p-2.5 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span>Categories</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('customers')}
                      className="p-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <Users className="w-4 h-4" />
                      <span>Customers</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="p-2.5 bg-[#06b6d4] hover:bg-[#0891b2] text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Site Settings</span>
                    </button>
                    <button
                      onClick={() => onNavigate('catalog')}
                      className="p-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Public Store</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: STORE OVERVIEW + RECENT ORDERS + TOP PRODUCTS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. Store Overview */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                      <Package className="w-4 h-4 text-[#0284c7]" />
                      <h3 className="font-bold text-sm text-[#0f3460]">Store Overview</h3>
                    </div>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>Total Products</span>
                        </div>
                        <span className="font-bold font-mono text-slate-800">{totalProductsCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <LayoutGrid className="w-4 h-4 text-slate-400" />
                          <span>Total Categories</span>
                        </div>
                        <span className="font-bold font-mono text-slate-800">12</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <Tag className="w-4 h-4 text-slate-400" />
                          <span>Total Brands</span>
                        </div>
                        <span className="font-bold font-mono text-slate-800">48</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <Ticket className="w-4 h-4 text-slate-400" />
                          <span>Total Coupons</span>
                        </div>
                        <span className="font-bold font-mono text-slate-800">{coupons.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-slate-600">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Content Pages</span>
                        </div>
                        <span className="font-bold font-mono text-slate-800">6</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/80 rounded-2xl p-4 shadow-xs text-xs space-y-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-[#0f3460] text-sm">Grow Your Business</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Use WhatsApp marketing and discounts to reach shoppers nationwide.
                    </p>
                    <button
                      onClick={() => setActiveTab('marketing')}
                      className="w-full py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <span>Go to Marketing</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 2. Recent Orders Table */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4 text-[#0284c7]" />
                        <h3 className="font-bold text-sm text-[#0f3460]">Recent Orders</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Orders</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700">
                        <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Product(s)</th>
                            <th className="py-2.5 px-3">Amount</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center mx-auto mb-2">
                                  <ShoppingCart className="w-4 h-4" />
                                </div>
                                <p className="font-bold text-slate-700 text-xs">No customer orders placed yet (0 orders)</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm mx-auto">
                                  Your store is ready for launch. When customers checkout with Cash on Delivery or Card, real-time order records will stream here automatically.
                                </p>
                              </td>
                            </tr>
                          ) : (
                            orders.slice(0, 7).map((o) => {
                              const isDelivered = o.orderStatus === 'delivered';
                              const isProcessing = o.orderStatus === 'processing' || o.orderStatus === 'shipped';
                              const isPending = o.orderStatus === 'pending_payment';
                              return (
                                <tr key={o.id} className="hover:bg-sky-50/30 transition-colors">
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#0284c7]">
                                    #{o.orderNumber}
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-800 font-semibold whitespace-nowrap">
                                    {o.customer.fullName}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center gap-2">
                                      {o.items[0] && (
                                        <img
                                          src={o.items[0].image}
                                          alt={o.items[0].name}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80';
                                          }}
                                          className="w-7 h-7 rounded-md object-cover bg-slate-100 shrink-0 border border-slate-200"
                                        />
                                      )}
                                      <span className="truncate max-w-[130px] font-medium text-slate-700">
                                        {o.items[0]?.name || 'Product'}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono font-bold text-[#0f3460] whitespace-nowrap">
                                    Rs. {o.total.toLocaleString()}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <span
                                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize whitespace-nowrap ${
                                        isDelivered
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : isProcessing
                                          ? 'bg-sky-100 text-sky-800'
                                          : isPending
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {isDelivered ? 'Completed' : isProcessing ? 'Processing' : isPending ? 'Pending' : 'Cancelled'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                                    {new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                  </td>
                                  <td className="py-2.5 px-3 text-right">
                                    <button
                                      onClick={() => handleOpenOrderInspect(o)}
                                      className="px-2.5 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 3. Top Selling Products */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🔥</span>
                        <h3 className="font-bold text-sm text-[#0f3460]">Featured Items</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('products')}
                        className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3 pt-1">
                      {topSellingProducts.map((p) => (
                        <div key={p.id} className="flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80';
                              }}
                              className="w-9 h-9 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                            />
                            <div className="truncate">
                              <p className="font-bold text-[#0f3460] truncate">{p.name}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{p.sold} in stock</p>
                            </div>
                          </div>
                          <span className="font-bold text-emerald-600 text-[11px] shrink-0 font-mono">
                            {p.growth}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Products & Inventory</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage catalog items, pricing in Pakistani Rupees (Rs.), SKU codes and stock quantities.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct({
                      category: 'mobiles-tablets',
                      stock: 15,
                      price: 4999,
                      images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'],
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-sky-500/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add New Product
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px]">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title or SKU..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium focus:outline-none focus:border-[#0284c7] cursor-pointer"
                >
                  <option value="all">All Departments ({products.length})</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="py-3 px-4">Item & SKU</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock Level</th>
                        <th className="py-3 px-4">Quick Adjust</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.slice(0, 50).map((p) => {
                        const isLow = p.stock > 0 && p.stock <= 5;
                        const isOut = p.stock === 0;
                        return (
                          <tr key={p.id} className="hover:bg-sky-50/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80';
                                  }}
                                  className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                                />
                                <div className="min-w-0 max-w-xs">
                                  <p className="font-bold text-[#0f3460] truncate">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-100 text-[11px] font-semibold">
                                {p.category.replace('-', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#0f3460]">
                              Rs. {p.price.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                  isOut
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : isLow
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOut ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, -1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer border border-slate-200"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-mono font-bold text-slate-800">{p.stock}</span>
                                <button
                                  onClick={() => handleQuickStockAdjust(p.id, 1)}
                                  className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center cursor-pointer border border-slate-200"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-[#0284c7] border border-slate-200 cursor-pointer"
                                  title="Edit Product"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Customer Orders Management</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Track shipments, verify payments, and dispatch courier tracking across Pakistan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Filter:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold cursor-pointer shadow-xs"
                  >
                    <option value="all">All Orders ({orders.length})</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Destination</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4 text-right">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-slate-400">
                            <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <p className="font-bold text-slate-700">No orders match the selected filter.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr
                            key={o.id}
                            onClick={() => handleOpenOrderInspect(o)}
                            className="hover:bg-sky-50/40 transition-colors cursor-pointer"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-[#0284c7]">
                              #{o.orderNumber}
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#0f3460]">{o.customer.fullName}</p>
                              <p className="text-[10px] text-slate-500">{o.customer.phone}</p>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-600">
                              {o.customer.city}, {o.customer.province}
                            </td>
                            <td className="py-3 px-4">
                              <span className="capitalize px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium">
                                {o.paymentMethod === 'cod' ? 'Cash on Delivery' : o.paymentMethod === 'bank_transfer' ? 'Wire Transfer' : 'JazzCash / EasyPaisa'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                                  o.orderStatus === 'delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : o.orderStatus === 'shipped'
                                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                    : o.orderStatus === 'processing'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : o.orderStatus === 'cancelled'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {o.orderStatus.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-[#0f3460]">
                              Rs. {o.total.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenOrderInspect(o);
                                }}
                                className="px-3 py-1 bg-sky-50 hover:bg-[#0284c7] hover:text-white text-[#0284c7] border border-sky-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Customer Directory</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    View registered users, delivery addresses, and customer profiles.
                  </p>
                </div>
                <div className="relative min-w-[240px]">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer by name or email..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact Phone</th>
                      <th className="py-3 px-4">City</th>
                      <th className="py-3 px-4">Role / Status</th>
                      <th className="py-3 px-4">Orders Placed</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-sky-50/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-[#0284c7] font-bold flex items-center justify-center">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-[#0f3460]">{c.name}</p>
                              <p className="text-[10px] text-slate-400">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono">{c.phone || '+92 300 0000000'}</td>
                        <td className="py-3 px-4">{c.address?.city || 'Pakistan'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {c.role === 'admin' ? 'Store Admin' : 'Verified Buyer'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {orders.filter(o => o.customer.email === c.email).length} Orders
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              showToast('Customer Details', `${c.name}: ${c.phone} (${c.address?.city || 'Pakistan'})`, 'info');
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: COMPLAINTS */}
          {activeTab === 'complaints' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">
                    Customer Complaints &amp; Inquiries
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage customer dispute resolution, damaged item claims, return requests, and respond directly.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {(['all', 'pending', 'in_review', 'resolved'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setComplaintFilter(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                        complaintFilter === st
                          ? 'bg-[#0284c7] text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {st.replace('_', ' ')}
                      {st === 'pending' && complaints.filter(c => c.status === 'pending').length > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px]">
                          {complaints.filter(c => c.status === 'pending').length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaints Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                {complaints.filter(c => complaintFilter === 'all' || c.status === complaintFilter).length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No Customer Complaints</p>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                      All customer feedback and dispute tickets will appear here with instant reply and status tracking.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {complaints
                      .filter(c => complaintFilter === 'all' || c.status === complaintFilter)
                      .map((c) => (
                        <div key={c.id} className="p-5 space-y-3 hover:bg-slate-50/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-xs text-[#0284c7]">#{c.id}</span>
                              <h4 className="font-bold text-sm text-[#0f3460]">{c.subject}</h4>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {c.category.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                c.status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : c.status === 'in_review'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {c.status.replace('_', ' ')}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(c.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
                            <p>{c.message}</p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-medium">
                              <span><strong>Customer:</strong> {c.customerName}</span>
                              <span><strong>Email:</strong> {c.customerEmail}</span>
                              {c.customerPhone && <span><strong>Phone:</strong> {c.customerPhone}</span>}
                              {c.orderNumber && <span><strong>Order:</strong> #{c.orderNumber}</span>}
                            </div>
                          </div>
                          {c.response && (
                            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                              <p className="font-bold text-[11px] text-emerald-800">Admin Response:</p>
                              <p className="mt-0.5">{c.response}</p>
                            </div>
                          )}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Type response to customer..."
                              value={complaintResponses[c.id] || ''}
                              onChange={(e) => setComplaintResponses({ ...complaintResponses, [c.id]: e.target.value })}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                            />
                            <div className="flex items-center gap-2">
                              {c.status !== 'in_review' && (
                                <button
                                  onClick={() => handleUpdateComplaintStatus(c.id, 'in_review')}
                                  className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#0284c7] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                  Mark In Review
                                </button>
                              )}
                              {c.status !== 'resolved' && (
                                <button
                                  onClick={() => handleUpdateComplaintStatus(c.id, 'resolved')}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                >
                                  Resolve Ticket
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Store Categories (12 Departments)</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Configure store departments, Urdu labels, department images, and product inventory mappings.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={cat.image} 
                        alt={cat.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80';
                        }}
                        className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200" 
                      />
                      <div>
                        <h4 className="font-bold text-sm text-[#0f3460]">{cat.name}</h4>
                        <p className="text-xs font-bold text-[#0284c7]">{cat.urduName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.productCount} active products</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setProductCategoryFilter(cat.id);
                        setActiveTab('products');
                      }}
                      className="px-3 py-1.5 bg-sky-50 hover:bg-[#0284c7] hover:text-white text-[#0284c7] border border-sky-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      View Items
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BRANDS */}
          {activeTab === 'brands' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Official Brands & Partners</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Verified manufacturers with 100% genuine guarantees in Pakistan.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {brandsList.map((b) => (
                  <div key={b.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-lg text-[#0f3460]">{b.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Origin: {b.origin}</p>
                    <p className="text-xs font-bold text-[#0284c7] font-mono">{b.productsCount} catalog items</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Promotional Coupons & Vouchers</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage active store discount codes, percentage vouchers, and minimum cart constraints.
                  </p>
                </div>
              </div>

              {/* Add Coupon Form */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h3 className="font-bold text-sm text-[#0f3460] mb-3">Create New Promotional Code</h3>
                <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="Coupon Code (e.g. FLASH25)"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCouponDiscount}
                    onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                    placeholder="Discount %"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                  <input
                    type="text"
                    value={newCouponDesc}
                    onChange={(e) => setNewCouponDesc(e.target.value)}
                    placeholder="Description label"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                  <button
                    type="submit"
                    className="bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs py-2 cursor-pointer shadow-sm transition-all"
                  >
                    Activate Coupon
                  </button>
                </form>
              </div>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div key={c.code} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-base text-[#0284c7] px-2.5 py-1 bg-sky-50 rounded-lg border border-sky-200">
                        {c.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mt-1">{c.description}</p>
                    <p className="text-[11px] text-slate-400">
                      Discount: {c.discountPercentage ? `${c.discountPercentage}% OFF` : `Rs. ${c.discountFixed}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Store Financial & Sales Reports</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Gross revenue, order velocity, payment method distribution and average customer cart size.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Average Order Value (AOV)</span>
                  <h3 className="text-2xl font-black text-[#0f3460] font-mono">
                    Rs. {Math.round(totalSalesAmount / (totalOrdersCount || 1)).toLocaleString()}
                  </h3>
                  <p className="text-[11px] text-emerald-600 font-bold">Standard Pakistani basket size</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Fulfillment Success Rate</span>
                  <h3 className="text-2xl font-black text-emerald-600 font-mono">98.2%</h3>
                  <p className="text-[11px] text-slate-500">Delivered via TCS & Leopards nationwide</p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Customer Return Rate</span>
                  <h3 className="text-2xl font-black text-slate-700 font-mono">1.8%</h3>
                  <p className="text-[11px] text-slate-500">Protected by 7-day checking guarantee</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-[#0f3460]">Export Financial & Audit Data</h4>
                  <p className="text-xs text-slate-500">Generate verified JSON report of all store operations.</p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Download Financial Report (JSON)
                </button>
              </div>
            </div>
          )}

          {/* TAB: MARKETING */}
          {activeTab === 'marketing' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Marketing & Broadcast Suite</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Direct SMS & WhatsApp marketing broadcasts to registered shoppers.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#0f3460]">Direct WhatsApp & SMS Broadcast</h4>
                    <p className="text-xs text-slate-500">Official broadcast via verified store helpline (+92 346 7792177)</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Customer Audience</label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium w-full max-w-md"
                    >
                      <option value="all">All Registered Customers ({totalCustomersCount})</option>
                      <option value="repeat">Repeat Shoppers (2+ Orders)</option>
                      <option value="cart_abandon">Cart Abandonment (Last 24 Hours)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Broadcast Message Body</label>
                    <textarea
                      rows={3}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800"
                    />
                  </div>

                  <button
                    onClick={() => {
                      showToast('Broadcast Dispatched', `Broadcast queued for ${totalCustomersCount} recipients!`, 'success');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <Send className="w-4 h-4" />
                    Send Broadcast Campaign
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CONTENT PAGES */}
          {activeTab === 'content_pages' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Store Content & Legal Pages</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Manage static informational and policy pages displayed in the website footer.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'About Easy Store Pakistan', path: '/about', status: 'Published' },
                  { title: 'Shipping & Delivery Policy', path: '/shipping-policy', status: 'Published' },
                  { title: 'Returns & 7-Day Refund Policy', path: '/returns', status: 'Published' },
                  { title: 'Privacy & Data Protection', path: '/privacy', status: 'Published' },
                  { title: 'Terms & Conditions of Service', path: '/terms', status: 'Published' },
                  { title: 'Customer Support & Contact Info', path: '/support', status: 'Published' },
                ].map((pg) => (
                  <div key={pg.title} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#0f3460]">{pg.title}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {pg.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-1">{pg.path}</p>
                    </div>
                    <button
                      onClick={() => showToast('Page Editor', `Editing ${pg.title}`, 'info')}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold mt-2 cursor-pointer transition-colors"
                    >
                      Edit Page Content
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BANNER MANAGEMENT */}
          {activeTab === 'banner_management' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">Storefront Banner Slides</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Configure the primary hero banner, mega discount carousel and seasonal campaigns.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <img
                    src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80"
                    alt="iPhone Banner"
                    className="w-full h-36 rounded-xl object-cover"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#0f3460]">Online Shopping Destination</p>
                      <p className="text-xs text-slate-500">Accurate Products | Best Prices | Fast Delivery</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Live on Homepage
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                  <img
                    src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=800&q=80"
                    alt="Electronics Mega Sale"
                    className="w-full h-36 rounded-xl object-cover"
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-[#0f3460]">Mega Electronics Clearance</p>
                      <p className="text-xs text-slate-500">Up to 50% OFF with official Pakistan checking warranty</p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Live on Homepage
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">System Settings & Integrations</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Diagnostic matrix, database backup & restore, and security passphrase controls.
                </p>
              </div>

              {/* Status Matrix */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-[#0f3460] flex items-center gap-2">
                      <Database className="w-5 h-5 text-[#0284c7]" />
                      External Integrations & Credentials Diagnostic
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Live inspection of backend database URLs, payment gateway keys, and Gemini AI tokens
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                    {integrations.databaseType === 'client_indexed_db' ? 'Client Persistent Engine Active' : 'Remote API Connected'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {credentialRequirements.map((req) => (
                    <div
                      key={req.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                        req.isConfigured
                          ? 'bg-emerald-50/40 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-[#0f3460]">{req.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              req.isConfigured
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.isConfigured ? 'Connected' : 'Missing Config'}
                          </span>
                        </div>
                        <code className="text-[10px] font-mono text-slate-600 block bg-white px-2 py-0.5 rounded border border-slate-200 w-fit mb-2">
                          {req.envVar}
                        </code>
                        <p className="text-xs text-slate-600 leading-relaxed mb-2">{req.description}</p>
                        <p className="text-[11px] text-slate-500 leading-relaxed bg-white/90 p-2.5 rounded-xl border border-slate-200">
                          {req.setupInstructions}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database Backup & Restore */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#0f3460]">Database Backup & Recovery</h3>
                <p className="text-xs text-slate-500">
                  Export your store&apos;s product catalog, customer orders, and credentials to a verified JSON file, or restore from a previous backup.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={handleExportJson}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    Export Database (JSON Backup)
                  </button>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-xs"
                  >
                    <Upload className="w-4 h-4 text-[#0284c7]" />
                    Import Database (JSON)
                  </button>
                  <button
                    onClick={handleResetCatalog}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset to Seed Store Catalog
                  </button>
                </div>
              </div>

              {/* Admin Security Settings */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#0f3460] flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  Change Master Admin Passphrase
                </h3>
                <p className="text-xs text-slate-500">
                  Update the security passcode required to unlock the Admin Portal.
                </p>
                <form onSubmit={handleChangePassphrase} className="flex gap-2 max-w-md">
                  <input
                    type="password"
                    value={newPassphrase}
                    onChange={(e) => setNewPassphrase(e.target.value)}
                    placeholder="Enter new strong passphrase..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-md shadow-sky-500/20"
                  >
                    Save Passphrase
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ORDER INSPECT MODAL */}
      {inspectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="relative bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-400 uppercase font-mono font-bold">Fulfillment Dispatch</span>
                <h3 className="text-xl font-black text-[#0f3460] font-mono">
                  Order #{inspectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setInspectedOrder(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Recipient:</span>
                <p className="font-bold text-[#0f3460] mt-0.5">{inspectedOrder.customer.fullName}</p>
                <p className="text-slate-600 font-medium">{inspectedOrder.customer.phone}</p>
                <p className="text-slate-600 mt-1">{inspectedOrder.customer.addressLine1}, {inspectedOrder.customer.city}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment & Value:</span>
                <p className="font-bold text-[#0284c7] font-mono text-sm mt-0.5">Rs. {inspectedOrder.total.toLocaleString()}</p>
                <p className="text-slate-600 capitalize">Method: {inspectedOrder.paymentMethod.replace('_', ' ')}</p>
                {inspectedOrder.paymentReference && (
                  <p className="text-slate-500 font-mono text-[11px]">Ref: {inspectedOrder.paymentReference}</p>
                )}
              </div>
            </div>

            <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Change Fulfillment Status
                </label>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white cursor-pointer font-medium"
                >
                  <option value="pending_payment">Pending Payment (Awaiting confirmation)</option>
                  <option value="processing">Processing (Being packed in warehouse)</option>
                  <option value="shipped">Shipped (Dispatched with courier)</option>
                  <option value="delivered">Delivered (Handed over to customer)</option>
                  <option value="cancelled">Cancelled (Restore inventory to stock)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Carrier Name
                  </label>
                  <input
                    type="text"
                    value={carrier}
                    onChange={(e) => setCarrier(e.target.value)}
                    placeholder="TCS Express, Leopards, Trax..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. TCS-PK-98432176"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Status History Audit Note (Visible to Customer)
                </label>
                <input
                  type="text"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="e.g. Order verified and dispatched from Karachi fulfillment center."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/25 cursor-pointer transition-all"
                >
                  Save &amp; Publish Status Update
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedOrder(null)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT ADD / EDIT MODAL */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="relative bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 text-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0f3460]">
                {editingProduct.id ? 'Edit Product Record' : 'Create New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Samsung Galaxy S24 Ultra 512GB Titanium"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department / Category</label>
                  <select
                    value={editingProduct.category || 'mobiles-tablets'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white font-medium cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    placeholder="MOB-901"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Selling Price (Rs.) *</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editingProduct.price ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wholesale Cost (Rs.)</label>
                  <input
                    type="number"
                    step="1"
                    value={editingProduct.cost ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) || undefined })}
                    placeholder="Cost price"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Compare Price (Rs.)</label>
                  <input
                    type="number"
                    step="1"
                    value={editingProduct.compareAtPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, compareAtPrice: parseFloat(e.target.value) || undefined })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                  />
                </div>
              </div>

              {/* Product Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Image URL
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {editingProduct.images?.[0] ? (
                      <img
                        src={editingProduct.images[0]}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      value={editingProduct.images?.[0] || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Summary</label>
                <input
                  type="text"
                  value={editingProduct.shortDescription || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shortDescription: e.target.value })}
                  placeholder="Original brand warranty with official PTA approved status..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Detailed technical specifications, warranty terms, and box content..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-sky-500/25 transition-all"
                >
                  Save Product to Database
                </button>
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JSON IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 text-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-[#0f3460]">Import Database Backup</h3>
              <button onClick={() => setShowImportModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleImportJson} className="space-y-4">
              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder="Paste valid Easy Store exported JSON here..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={!importJsonText.trim()}
                  className="flex-1 py-3 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-sky-500/25 transition-all"
                >
                  Restore Database
                </button>
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
