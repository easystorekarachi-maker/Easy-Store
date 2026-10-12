import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  Check, 
  ChevronRight, 
  ShoppingBag
} from 'lucide-react';
import { Product, ProductCategory, StoreViewMode } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES, CURATED_PRODUCTS } from '../data/seedData';
import { OwnerAvatar } from '../components/OwnerAvatar';

interface StoreViewProps {
  products: Product[];
  selectedCategory: ProductCategory | 'all';
  onSelectCategory: (cat: ProductCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onNavigate: (view: StoreViewMode) => void;
}

type SortOption = 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';

export const StoreView: React.FC<StoreViewProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenProductDetail,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(450000);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 24;

  // Extract top brands for current selection
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
    });
    return Array.from(brandSet).slice(0, 15);
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Brand filter
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
          if (!matchName && !matchDesc && !matchSku && !matchBrand) {
            return false;
          }
        }
        // Price range in Rs.
        if (p.price > priceRange) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // Featured
        if (a.bestSeller && !b.bestSeller) return -1;
        if (!a.bestSeller && b.bestSeller) return 1;
        return b.rating - a.rating;
      });
  }, [products, selectedCategory, selectedBrand, searchQuery, priceRange, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 850, behavior: 'smooth' });
  };

  const resetFilters = () => {
    onSelectCategory('all');
    setSelectedBrand('all');
    setPriceRange(450000);
    onSearchChange('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* 1. Hero Banner */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="bg-gradient-to-r from-[#eef6fc] via-[#f0f8ff] to-[#e8f3fc] border-b border-sky-100 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-5 space-y-4">
                <span className="text-sm font-bold text-slate-500 tracking-wide uppercase">
                  Your All-in-One
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-[#0f3460] leading-tight tracking-tight">
                  Online Shopping <br />
                  <span className="text-[#0284c7]">Destination</span>
                </h1>
                <p className="text-sm font-semibold text-slate-600 flex items-center gap-2 flex-wrap">
                  <span>Accurate Products</span>
                  <span>|</span>
                  <span>Best Prices</span>
                  <span>|</span>
                  <span>Fast Delivery</span>
                </p>
                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 800, behavior: 'smooth' });
                    }}
                    className="px-7 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-sm font-bold shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Founder Trust Tag with Abdullah Portrait */}
                  <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-sky-200/80 shadow-xs">
                    <OwnerAvatar size="md" className="ring-2 ring-[#0284c7]" />
                    <div className="leading-tight text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">Abdullah (Founder)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">100% Guaranteed Original Products</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Visual */}
              <div className="lg:col-span-7 relative flex items-center justify-center">
                <div className="relative w-full max-w-xl">
                  {/* Decorative Banner Graphics */}
                  <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-sky-100 grid grid-cols-3 gap-3 items-center">
                    <img
                      src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80"
                      alt="iPhone 15 Pro Max"
                      className="rounded-2xl object-cover h-36 w-full shadow-md"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=400&q=80"
                      alt="Headphones"
                      className="rounded-2xl object-cover h-36 w-full shadow-md"
                    />
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80"
                      alt="Smartwatch"
                      className="rounded-2xl object-cover h-36 w-full shadow-md"
                    />
                  </div>
                  {/* Badge */}
                  <div className="absolute -bottom-4 right-4 bg-[#0f3460] text-white p-3 px-5 rounded-2xl shadow-xl transform rotate-2">
                    <p className="text-xs font-black tracking-wide text-cyan-300">
                      Better Products
                    </p>
                    <p className="text-sm font-black text-white">
                      + Bigger Smiles 😊
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Quick Category Cards Carousel / Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800">Shop by Category</h2>
          <span className="text-xs text-slate-500 font-semibold">12 Departments</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {CATEGORIES.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setCurrentPage(1);
              }}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between group transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-50 border-[#0284c7] shadow-md ring-1 ring-[#0284c7]'
                  : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden mb-2 group-hover:scale-105 transition-transform flex items-center justify-center">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-[#0284c7]" />
                )}
              </div>
              <div className="w-full">
                <span className="text-[11px] font-bold text-slate-700 block truncate leading-tight group-hover:text-[#0284c7]">
                  {cat.name}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                  &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Four Promotional Banners Grid */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Banner 1: Cyan/Blue 50% OFF */}
            <div className="bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Flash Deals
                </span>
                <h3 className="text-3xl font-black mt-2">UPTO 50% OFF</h3>
                <p className="text-xs text-sky-100 font-medium mt-1">Top Brands, Great Deals</p>
              </div>
              <button
                onClick={() => {
                  onSelectCategory('electronics');
                  setCurrentPage(1);
                }}
                className="w-fit px-3 py-1.5 bg-white text-[#0284c7] rounded-lg text-xs font-bold shadow hover:bg-slate-50 cursor-pointer"
              >
                Shop Now &rarr;
              </button>
            </div>

            {/* Banner 2: Pink/Purple Fashion Trends */}
            <div className="bg-gradient-to-br from-[#ec4899] to-[#be185d] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  New Arrival
                </span>
                <h3 className="text-2xl font-black mt-2">Fashion Trends</h3>
                <p className="text-xs text-pink-100 font-medium mt-1">Style for Every You</p>
              </div>
              <button
                onClick={() => {
                  onSelectCategory('fashion');
                  setCurrentPage(1);
                }}
                className="w-fit px-3 py-1.5 bg-white text-[#be185d] rounded-lg text-xs font-bold shadow hover:bg-slate-50 cursor-pointer"
              >
                Shop Now &rarr;
              </button>
            </div>

            {/* Banner 3: Teal/Green Home & Living */}
            <div className="bg-gradient-to-br from-[#0d9488] to-[#0f766e] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Home Comfort
                </span>
                <h3 className="text-2xl font-black mt-2">Home & Living</h3>
                <p className="text-xs text-teal-100 font-medium mt-1">Make Your Home More Beautiful</p>
              </div>
              <button
                onClick={() => {
                  onSelectCategory('home-living');
                  setCurrentPage(1);
                }}
                className="w-fit px-3 py-1.5 bg-white text-[#0f766e] rounded-lg text-xs font-bold shadow hover:bg-slate-50 cursor-pointer"
              >
                Shop Now &rarr;
              </button>
            </div>

            {/* Banner 4: Yellow/Orange Electronics */}
            <div className="bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between h-44 relative overflow-hidden">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Tech Essentials
                </span>
                <h3 className="text-2xl font-black mt-2">Electronics</h3>
                <p className="text-xs text-amber-100 font-medium mt-1">Latest Gadgets, Best Prices</p>
              </div>
              <button
                onClick={() => {
                  onSelectCategory('electronics');
                  setCurrentPage(1);
                }}
                className="w-fit px-3 py-1.5 bg-white text-[#d97706] rounded-lg text-xs font-bold shadow hover:bg-slate-50 cursor-pointer"
              >
                Shop Now &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Best Selling Products Row */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                Best Selling Products
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Pakistan&apos;s most ordered electronics, mobiles and home products
              </p>
            </div>
            <button
              onClick={() => {
                onSelectCategory('all');
                window.scrollTo({ top: 1200, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-[#0284c7] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All 4,850+</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {CURATED_PRODUCTS.slice(0, 8).map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onOpenDetail={onOpenProductDetail}
              />
            ))}
          </div>
        </section>
      )}

      {/* 5. Complete 4,850+ Products Catalog Explorer with Pakistani Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-black text-slate-900 capitalize">
              {selectedCategory === 'all' ? 'All Products Catalog' : selectedCategory.replace('-', ' ')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {paginatedProducts.length} of {filteredProducts.length.toLocaleString()} products available across Pakistan
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#0284c7] cursor-pointer shadow-xs"
            >
              <option value="featured">Featured / Best Sellers</option>
              <option value="price_asc">Price: Low to High (Rs.)</option>
              <option value="price_desc">Price: High to Low (Rs.)</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Stock</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#0284c7]" />
                  Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#0284c7] hover:underline font-semibold cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Department Categories */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2.5">
                  Department
                </h4>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-sky-50 text-[#0284c7] font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px] text-slate-400">4,850+</span>
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCategory(c.id);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex justify-between items-center transition-colors cursor-pointer ${
                        selectedCategory === c.id
                          ? 'bg-sky-50 text-[#0284c7] font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.productCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Popular Brands in Pakistan
                </h4>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className={`w-full text-left px-2 py-1 rounded text-xs cursor-pointer ${
                      selectedBrand === 'all' ? 'text-[#0284c7] font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Brands
                  </button>
                  {availableBrands.map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b);
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-xs cursor-pointer ${
                        selectedBrand === b ? 'text-[#0284c7] font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider in Rs. */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-700">Max Price:</span>
                  <span className="font-black text-[#dc2626]">Rs. {priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="450000"
                  step="5000"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Rs. 2,000</span>
                  <span>Rs. 450,000+</span>
                </div>
              </div>

              {/* Delivery Perks */}
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-[11px] text-[#0f3460] space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#0284c7]" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>7 Days Return Warranty</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Product Grid & Pagination */}
          <div className="lg:col-span-9 space-y-6">
            {paginatedProducts.length === 0 ? (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Try adjusting your search query, price limit or brand filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#0284c7] text-white rounded-xl text-xs font-bold shadow hover:bg-[#0369a1] cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {paginatedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onOpenDetail={onOpenProductDetail}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200 text-xs font-bold">
                    <span className="text-slate-500">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer"
                      >
                        Previous
                      </button>

                      {/* Dynamic Page Buttons */}
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-[#0284c7] text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {totalPages > 5 && (
                        <>
                          <span className="px-1 text-slate-400">...</span>
                          <button
                            onClick={() => handlePageChange(totalPages)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                              currentPage === totalPages
                                ? 'bg-[#0284c7] text-white'
                                : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg disabled:opacity-40 cursor-pointer ml-1"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* 6. Trust Badges Ribbon */}
      <section className="bg-white border-y border-slate-200 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">Safe & Secure Shopping</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Your data is safe with us</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">Fast & Reliable Delivery</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Across all cities in Pakistan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">Easy Returns</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Hassle free 7-day policy</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-[#0284c7] shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-xs sm:text-sm">24/7 Customer Support</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">We&apos;re always here to help</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
