import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Heart, 
  User as UserIcon, 
  ShieldCheck, 
  Shield, 
  Menu, 
  X, 
  Package, 
  LogOut, 
  LogIn, 
  UserPlus,
  ChevronDown,
  PhoneCall,
  Truck,
  CheckCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../data/seedData';
import { ProductCategory, Product, StoreViewMode } from '../types';
import { OwnerAvatar } from './OwnerAvatar';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  currentView: StoreViewMode;
  onNavigate: (view: StoreViewMode) => void;
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  allProducts: Product[];
  onOpenProductDetail: (product: Product) => void;
  onOpenAppDownload?: (tab: 'google_play' | 'app_store' | 'direct_apk') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  allProducts,
  onOpenProductDetail,
  onOpenAppDownload,
}) => {
  const { itemCount, setIsCartOpen, wishlist } = useCart();
  const { user, isAuthenticated, isAdminUnlocked, logout, setShowAuthModal, openAuthModal, setShowAdminGateModal } = useAuth();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchSuggestions = searchQuery.trim().length > 1
    ? allProducts
        .filter((p) => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleAdminClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const adminUrl = `${window.location.origin}${window.location.pathname}?view=admin`;
    const newWindow = window.open(adminUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      onNavigate('admin');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 text-slate-800 shadow-sm">
      {/* 1. Top Ribbon & Live Running Headline Ticker */}
      <div className="bg-[#0b3c68] text-white text-[11px] sm:text-xs py-1.5 px-3 sm:px-4 font-medium border-b border-[#082d4f] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Running Headline Ticker with Founder Avatar */}
          <div className="flex-1 overflow-hidden relative flex items-center gap-2 mr-2">
            {/* Live Ticker Tag with Owner Badge */}
            <div className="shrink-0 flex items-center gap-1.5 bg-[#0284c7] text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
              <OwnerAvatar size="sm" className="ring-1 ring-white/80" />
              <span className="hidden xs:inline">LIVE STORE</span>
              <span className="xs:hidden">LIVE</span>
            </div>

            {/* Continuous Marquee Ticker */}
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="animate-marquee flex items-center gap-8 text-[11px] text-white/95 font-medium tracking-wide">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-bold">Easy Store Pakistan:</span>
                  <span>100% Original Products Guaranteed</span>
                </span>
                <span className="text-cyan-300">✦</span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-cyan-300 inline" />
                  <span>Free Fast Cash on Delivery on orders over Rs. 2,500</span>
                </span>
                <span className="text-cyan-300">✦</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
                  <span>7-Day Checking Warranty Across Pakistan</span>
                </span>
                <span className="text-cyan-300">✦</span>
                <span className="flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-300 inline" />
                  <span>WhatsApp Helpline: <strong className="text-white">+92 346 7792177</strong></span>
                </span>
                <span className="text-cyan-300">✦</span>
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-bold">Coupon Code:</span>
                  <span className="bg-white/20 px-1 rounded font-mono font-bold text-amber-200">EASYSTORE</span>
                  <span>for 10% Discount</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-4 text-white/95 shrink-0 text-[11px]">
            <button
              onClick={() => onOpenAppDownload?.('google_play')}
              className="hover:text-cyan-200 flex items-center gap-1.5 font-bold bg-white/15 hover:bg-white/25 px-2.5 py-0.5 rounded-full text-[11px] cursor-pointer transition-all"
            >
              <span>📲 Download App</span>
            </button>
            <span className="opacity-40 hidden sm:inline">|</span>
            <button
              onClick={() => onNavigate('tracking')}
              className="hover:underline hidden sm:flex items-center gap-1 cursor-pointer"
            >
              <span>Track Order</span>
            </button>
            <div className="hidden lg:flex items-center gap-1.5 font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Trusted Nationwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Brand & Search Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Brand Logo with Link to Home */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('all');
              }}
              className="group cursor-pointer focus:outline-none"
            >
              <BrandLogo size="md" />
            </button>
          </div>

          {/* Center Search Bar with Blue Button */}
          <div ref={searchContainerRef} className="flex-1 max-w-2xl hidden md:block relative">
            <div className="flex items-center rounded-xl border-2 border-[#0284c7] bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#0284c7]/20 transition-all">
              <div className="pl-3.5 text-slate-400">
                <Search className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search for products, brands and more across Pakistan..."
                className="w-full py-2.5 px-3 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('catalog');
                  setIsSearchFocused(false);
                }}
                className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-3 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {isSearchFocused && searchQuery.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <div className="p-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 flex justify-between items-center">
                  <span>Product Suggestions ({searchSuggestions.length})</span>
                  <span className="text-[11px] text-slate-400">40,000+ Products Catalog</span>
                </div>
                {searchSuggestions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No products matching &quot;{searchQuery}&quot; found.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onOpenProductDetail(item);
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left p-3 hover:bg-sky-50/70 flex items-center gap-3 transition-colors group cursor-pointer"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80';
                          }}
                          className="w-11 h-11 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 group-hover:text-[#0284c7] truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.brand && <span className="font-semibold text-slate-600">{item.brand}</span>}
                            <span>•</span>
                            <span className="font-black text-[#0284c7]">Rs. {item.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          In Stock
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Icons & Account: Login / Sign Up, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Account Controls: Login & Sign Up (When logged out) or Profile Menu (When logged in) */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-[#0284c7] cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center font-bold text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block leading-none">
                    <span className="text-[10px] text-slate-400 block font-medium">Hello,</span>
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[80px]">
                      {user?.name?.split(' ')[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="font-bold text-slate-800">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {user?.role === 'admin' ? 'Store Manager' : 'Verified Pakistan Customer'}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('order_history');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      My Orders
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('tracking');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Truck className="w-4 h-4 text-slate-400" />
                      Track Order Status
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 cursor-pointer border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* DUAL LOGIN & SIGN UP BUTTONS IN SECOND HEADER */
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => openAuthModal('customer_login')}
                  className="px-3 sm:px-4 py-2 bg-slate-100 hover:bg-sky-50 text-slate-800 hover:text-[#0284c7] font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 shadow-2xs hover:border-[#0284c7]/40"
                  title="Customer Login"
                >
                  <LogIn className="w-4 h-4 text-[#0284c7]" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => openAuthModal('customer_register')}
                  className="px-3 sm:px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/25 cursor-pointer hover:scale-[1.02] active:scale-98"
                  title="Create New Account"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Sign Up</span>
                </button>
              </div>
            )}

            {/* Wishlist Icon */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="relative flex flex-col items-center text-slate-700 hover:text-[#0284c7] cursor-pointer transition-colors p-1"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative">
                <Heart className="w-4 h-4" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0284c7] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-semibold mt-0.5">Wishlist</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex flex-col items-center text-slate-700 hover:text-[#0284c7] cursor-pointer transition-colors p-1"
              aria-label="View Shopping Cart"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center relative">
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#0284c7] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              </div>
              <span className="text-[11px] font-semibold mt-0.5">Cart</span>
            </button>

            {/* Owner & Admin Management Button with Founder Avatar */}
            <button
              onClick={handleAdminClick}
              title={isAdminUnlocked ? 'Admin Portal (Active) - Founder Abdullah' : 'Admin Portal (Passcode Required)'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm ring-2 ring-sky-300'
                  : isAdminUnlocked
                  ? 'bg-sky-50 text-[#0284c7] border-sky-300 hover:bg-sky-100'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-sky-300'
              }`}
            >
              <OwnerAvatar size="sm" className="ring-1 ring-sky-400" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-slate-400 font-medium">Owner</span>
                <span className="text-[11px] font-bold text-slate-800">Abdullah</span>
              </div>
              {isAdminUnlocked ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 ml-0.5" /> : <Shield className="w-3 h-3 text-slate-400 ml-0.5" />}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pt-2.5">
          <div className="flex items-center rounded-xl border-2 border-[#0284c7] overflow-hidden bg-white">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products in Pakistan..."
              className="w-full py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={() => onNavigate('catalog')}
              className="bg-[#0284c7] text-white px-4 py-2.5 text-xs font-bold cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Category Sub-Header Navigation */}
      <div className="border-t border-slate-200 bg-white shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs font-bold">
          {/* "All Categories" Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white py-2.5 px-4 rounded-t-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Menu className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
            </button>

            {categoryDropdownOpen && (
              <div 
                className="absolute top-full left-0 w-64 bg-white border border-slate-200 rounded-b-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in"
                onMouseLeave={() => setCategoryDropdownOpen(false)}
              >
                <div className="p-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Browse Departments
                </div>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate('catalog');
                      onSelectCategory(cat.id);
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-sky-50 flex items-center justify-between text-slate-700 hover:text-[#0284c7] transition-colors cursor-pointer"
                  >
                    <span className="font-semibold">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({cat.productCount}+)</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Category Links Bar */}
          <div className="hidden md:flex items-center gap-1 lg:gap-3 overflow-x-auto py-1 text-slate-700">
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('all');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'all' && currentView === 'catalog'
                  ? 'text-[#0284c7] bg-sky-50'
                  : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('electronics');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'electronics' ? 'text-[#0284c7] bg-sky-50' : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Electronics
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('mobiles-tablets');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'mobiles-tablets' ? 'text-[#0284c7] bg-sky-50' : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Mobiles
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('fashion');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'fashion' ? 'text-[#0284c7] bg-sky-50' : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Fashion
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('home-living');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'home-living' ? 'text-[#0284c7] bg-sky-50' : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Home & Living
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('beauty-health');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'beauty-health' ? 'text-[#0284c7] bg-sky-50' : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Beauty & Health
            </button>
            <button
              onClick={() => {
                onNavigate('catalog');
                onSelectCategory('sports-outdoor');
              }}
              className={`px-3 py-2 rounded-lg font-semibold transition-colors cursor-pointer ${
                selectedCategory === 'sports-outdoor' ? 'text-[#0284c7] bg-sky-50' : 'hover:text-[#0284c7] hover:bg-slate-50'
              }`}
            >
              Sports & Outdoor
            </button>
            <button
              onClick={() => {
                onNavigate('support');
              }}
              className="px-3 py-2 rounded-lg font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>Customer Help</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-500 font-semibold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>40,000+ Products Ready to Dispatch</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <div className="font-bold text-xs text-slate-400 uppercase">Categories</div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            {CATEGORIES.slice(0, 8).map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onNavigate('catalog');
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className="text-left p-2 rounded-lg bg-slate-50 hover:bg-sky-50 text-slate-700 cursor-pointer"
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenAppDownload?.('google_play');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-[#0284c7] font-bold cursor-pointer flex items-center gap-1.5"
            >
              <span>📲 Download Mobile App (Android &amp; iOS)</span>
            </button>
            <button
              onClick={() => {
                onNavigate('tracking');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-slate-700 font-semibold cursor-pointer"
            >
              Track Order with ID
            </button>
            <button
              onClick={() => {
                onNavigate('support');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-emerald-600 font-bold cursor-pointer"
            >
              Customer Support & WhatsApp
            </button>
            <button
              onClick={() => {
                handleAdminClick();
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 text-xs text-amber-600 font-bold cursor-pointer"
            >
              Admin Portal
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
