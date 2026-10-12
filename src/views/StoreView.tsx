import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  ChevronLeft,
  ShoppingBag,
  Sparkles,
  Tag,
  Flame,
  Grid,
  X,
  Smartphone,
  Tv,
  Camera,
  Shirt,
  Home,
  Dumbbell,
  Gamepad,
  Laptop,
  Zap,
  Gamepad2
} from 'lucide-react';
import { BannerSlide, Product, ProductCategory, StoreViewMode } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/seedData';
import { OwnerAvatar } from '../components/OwnerAvatar';
import { db } from '../services/db';

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
  // Default sorting starts from lowest price (Rs. 100 up to Rs. 5,000 first)
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(100);
  const [priceRange, setPriceRange] = useState<number>(500000);
  const [activePriceBracket, setActivePriceBracket] = useState<'all' | 'under5k' | '5k_to_25k' | '25k_to_100k' | '100k_to_500k'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState<boolean>(false);
  const itemsPerPage = 24;

  // 10-Banner Carousel State
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState<number>(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState<boolean>(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const list = db.getBanners().filter((b) => b.active);
    setBanners(list);
  }, []);

  // Automatic slide rotation every 5 seconds
  useEffect(() => {
    if (banners.length <= 1 || isCarouselHovered) {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      return;
    }
    autoPlayRef.current = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [banners.length, isCarouselHovered]);

  const handleNextBanner = () => {
    if (banners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrevBanner = () => {
    if (banners.length === 0) return;
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handlePriceBracketChange = (bracket: 'all' | 'under5k' | '5k_to_25k' | '25k_to_100k' | '100k_to_500k') => {
    setActivePriceBracket(bracket);
    setCurrentPage(1);
    if (bracket === 'all') {
      setMinPrice(100);
      setPriceRange(500000);
    } else if (bracket === 'under5k') {
      setMinPrice(100);
      setPriceRange(5000);
    } else if (bracket === '5k_to_25k') {
      setMinPrice(5000);
      setPriceRange(25000);
    } else if (bracket === '25k_to_100k') {
      setMinPrice(25000);
      setPriceRange(100000);
    } else if (bracket === '100k_to_500k') {
      setMinPrice(100000);
      setPriceRange(500000);
    }
  };

  // Subcategory list based on current active category
  const activeCategoryInfo = useMemo(() => {
    if (selectedCategory === 'all') return null;
    return CATEGORIES.find((c) => c.id === selectedCategory) || null;
  }, [selectedCategory]);

  const activeSubCategories = useMemo(() => {
    if (!activeCategoryInfo?.subCategories) return [];
    return activeCategoryInfo.subCategories;
  }, [activeCategoryInfo]);

  // Extract top brands for current selection
  const availableBrands = useMemo(() => {
    const brandSet = new Set<string>();
    products.forEach((p) => {
      if (selectedCategory === 'all' || p.category === selectedCategory) {
        if (p.brand) brandSet.add(p.brand);
      }
    });
    return Array.from(brandSet).slice(0, 15);
  }, [products, selectedCategory]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'all' && p.category !== selectedCategory) {
          return false;
        }
        // Subcategory / Brand quick filter
        if (selectedSubCategory !== 'all') {
          const subLower = selectedSubCategory.toLowerCase();
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(subLower) : false;
          const matchName = p.name.toLowerCase().includes(subLower);
          const matchDesc = p.description.toLowerCase().includes(subLower);
          const matchSubCat = p.subCategory ? p.subCategory.toLowerCase().includes(subLower) : false;
          if (!matchBrand && !matchName && !matchDesc && !matchSubCat) {
            return false;
          }
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
        // Price range in PKR Rs. (starting from Rs. 100 up to Rs. 500,000)
        if (p.price < minPrice || p.price > priceRange) {
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
        return a.price - b.price;
      });
  }, [products, selectedCategory, selectedSubCategory, selectedBrand, searchQuery, minPrice, priceRange, sortBy]);

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
    setSelectedSubCategory('all');
    setMinPrice(100);
    setPriceRange(500000);
    setActivePriceBracket('all');
    setSortBy('price_asc');
    onSearchChange('');
    setCurrentPage(1);
  };

  const currentBanner = banners[currentBannerIndex] || null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-20">
      {/* 1. 10-BANNER INTERACTIVE 4K COMMERCIAL CAROUSEL WITH DOTS */}
      {!searchQuery && selectedCategory === 'all' && banners.length > 0 && currentBanner && (
        <section 
          className="relative bg-gradient-to-r from-[#072448] via-[#0f3460] to-[#0284c7] text-white overflow-hidden shadow-md"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          {/* Subtle decorative mesh overlay */}
          <div className="absolute inset-0 bg-radial-at-t from-sky-400/15 via-transparent to-black/40 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center min-h-[360px] sm:min-h-[420px]">
              
              {/* Left Text & Call to Action */}
              <div className="lg:col-span-6 space-y-4 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-black uppercase tracking-wider">
                    {currentBanner.badge || 'MEGA DEAL'}
                  </span>
                  {currentBanner.discountBadge && (
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900 text-[11px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                      {currentBanner.discountBadge}
                    </span>
                  )}
                  <span className="text-xs text-sky-200 font-bold hidden sm:inline">
                    Slide {currentBannerIndex + 1} of {banners.length}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-sm">
                  {currentBanner.title}
                </h1>

                <p className="text-xs sm:text-sm text-sky-100 font-medium leading-relaxed max-w-xl">
                  {currentBanner.subtitle}
                </p>

                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      if (currentBanner.ctaCategory && currentBanner.ctaCategory !== 'all') {
                        onSelectCategory(currentBanner.ctaCategory);
                      }
                      if (currentBanner.searchFilter) {
                        onSearchChange(currentBanner.searchFilter);
                      }
                      window.scrollTo({ top: 750, behavior: 'smooth' });
                    }}
                    className="px-6 sm:px-8 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-black shadow-lg shadow-sky-500/30 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-[1.02] active:scale-98"
                  >
                    <span>{currentBanner.ctaText || 'Shop Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Founder Trust Tag with Abdullah Portrait */}
                  <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/20 shadow-xs">
                    <OwnerAvatar size="sm" className="ring-2 ring-cyan-400" />
                    <div className="leading-tight text-left">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">Abdullah (Founder)</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <span className="text-[10px] text-sky-200 font-medium">100% Guaranteed Original Products</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4K Crisp Visual */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                <div className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
                  <img
                    src={currentBanner.imageUrl}
                    alt={currentBanner.title}
                    className="w-full h-64 sm:h-80 object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-5">
                    <div className="flex items-center justify-between w-full text-white text-xs font-bold">
                      <span className="bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/20">
                        Ultra 4K HD Quality
                      </span>
                      <span className="bg-[#0284c7] px-3 py-1 rounded-lg shadow-sm">
                        Cash on Delivery Across Pakistan
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Controls: Arrows + Indicator Dots */}
            <div className="flex items-center justify-between pt-6 border-t border-white/15 mt-6">
              {/* Previous / Next Arrow Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevBanner}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
                  aria-label="Previous Banner"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextBanner}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
                  aria-label="Next Banner"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 10 Banner Dots Indicator with 3-Dot Quick Indicators */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {banners.map((b, idx) => (
                  <button
                    key={b.id || idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    title={`Slide ${idx + 1}: ${b.title}`}
                    className={`h-2.5 transition-all rounded-full cursor-pointer ${
                      currentBannerIndex === idx
                        ? 'w-8 bg-cyan-300 shadow-md shadow-cyan-400/50'
                        : 'w-2.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Quick Slide Tag */}
              <div className="text-[11px] text-sky-200 font-bold bg-white/10 px-2.5 py-1 rounded-lg border border-white/15">
                4K Slider ({currentBannerIndex + 1}/{banners.length})
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 2. SHOP BY CATEGORY SECTION WITH "MORE CATEGORIES" BUTTON */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-black text-[#0f3460] flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0284c7]" />
              Shop by Category
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Explore 40,000+ verified items across all official departments
            </p>
          </div>
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-[#0284c7] border border-sky-200 flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>More Categories</span>
          </button>
        </div>

        {/* Categories Grid (Top 11 Departments + 12th "More" Card) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
          {CATEGORIES.slice(0, 11).map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                setSelectedSubCategory('all');
                setSelectedBrand('all');
                setCurrentPage(1);
              }}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between group transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-50 border-[#0284c7] shadow-md ring-2 ring-[#0284c7]'
                  : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-md'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden mb-2 group-hover:scale-105 transition-transform flex items-center justify-center border border-slate-100">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <ShoppingBag className="w-6 h-6 text-[#0284c7]" />
                )}
              </div>
              <div className="w-full">
                <span className="text-[11px] font-black text-slate-800 block truncate leading-tight group-hover:text-[#0284c7]">
                  {cat.name}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold block mt-0.5 truncate">
                  {cat.subtitle || 'Shop Now'}
                </span>
              </div>
            </button>
          ))}

          {/* 12th Card: "More Categories" */}
          <button
            onClick={() => setShowAllCategoriesModal(true)}
            className="p-3 rounded-2xl border border-dashed border-[#0284c7]/40 bg-sky-50/50 hover:bg-sky-100/70 text-center flex flex-col items-center justify-between group transition-all cursor-pointer shadow-2xs hover:border-[#0284c7]"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-100/80 flex items-center justify-center text-[#0284c7] mb-2 group-hover:scale-105 transition-transform">
              <Grid className="w-6 h-6" />
            </div>
            <div className="w-full">
              <span className="text-[11px] font-black text-[#0284c7] block truncate leading-tight">
                More
              </span>
              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">
                All Departments &rarr;
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* SUBCATEGORY & BRAND FILTER BAR (Shown when a category is selected) */}
      {selectedCategory !== 'all' && activeCategoryInfo && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="bg-white border border-sky-200 rounded-2xl p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-[#0284c7] font-black text-xs uppercase">
                  {activeCategoryInfo.name}
                </span>
                <span className="text-xs text-slate-500 font-bold">
                  Browse by Subcategory & Brand Model:
                </span>
              </div>
              <button
                onClick={() => {
                  onSelectCategory('all');
                  setSelectedSubCategory('all');
                  setSelectedBrand('all');
                }}
                className="text-xs font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear Department Filter</span>
              </button>
            </div>

            {/* Subcategory Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-3 scrollbar-none">
              <button
                onClick={() => setSelectedSubCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedSubCategory === 'all'
                    ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                All {activeCategoryInfo.name}
              </button>

              {activeSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setSelectedSubCategory(sub);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                    selectedSubCategory === sub
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-sky-50/50'
                  }`}
                >
                  <span>{sub}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. FOUR PROMOTIONAL FEATURE BOXES (OFFER WALL, TOP DEALS, BUDGET CORNER, FLAGSHIPS) */}
      {!searchQuery && selectedCategory === 'all' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Box 1: Offer Wall - Flash Deals Up to 70% OFF */}
            <div className="relative bg-gradient-to-br from-[#0284c7] to-[#0369a1] text-white rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[200px] group border border-sky-400/30">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/25">
                  OFFER WALL
                </span>
                <h3 className="text-2xl font-black mt-2 leading-tight">UP TO 70% OFF</h3>
                <p className="text-xs text-sky-100 font-medium mt-1">
                  Exclusive flash discounts & tech accessories
                </p>
              </div>
              <div className="relative z-10 pt-3">
                <button
                  onClick={() => {
                    handlePriceBracketChange('under5k');
                    window.scrollTo({ top: 800, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-white text-[#0284c7] hover:bg-slate-50 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Explore Offers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Floating 4K Image Graphic */}
              <img
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80"
                alt="Flash Deals"
                className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-2xl opacity-80 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/20 pointer-events-none"
              />
            </div>

            {/* Box 2: Top Deals & Audio Bundles */}
            <div className="relative bg-gradient-to-br from-[#ec4899] to-[#be185d] text-white rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[200px] group border border-pink-400/30">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/25">
                  TOP DEALS
                </span>
                <h3 className="text-2xl font-black mt-2 leading-tight">BUY 1 GET 1 & COMBOS</h3>
                <p className="text-xs text-pink-100 font-medium mt-1">
                  TWS Earbuds, ANC Headsets & Soundbars
                </p>
              </div>
              <div className="relative z-10 pt-3">
                <button
                  onClick={() => {
                    onSelectCategory('audio-sound');
                    window.scrollTo({ top: 800, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-white text-[#be185d] hover:bg-slate-50 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>View Top Deals</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Floating 4K Image Graphic */}
              <img
                src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80"
                alt="Audio Deals"
                className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-2xl opacity-80 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/20 pointer-events-none"
              />
            </div>

            {/* Box 3: Budget Corner (Rs. 100 - Rs. 5,000) */}
            <div className="relative bg-gradient-to-br from-[#059669] to-[#047857] text-white rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[200px] group border border-emerald-400/30">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/25">
                  BUDGET CORNER
                </span>
                <h3 className="text-2xl font-black mt-2 leading-tight">RS. 100 - RS. 5,000</h3>
                <p className="text-xs text-emerald-100 font-medium mt-1">
                  14,000+ daily essentials with Cash on Delivery
                </p>
              </div>
              <div className="relative z-10 pt-3">
                <button
                  onClick={() => {
                    handlePriceBracketChange('under5k');
                    window.scrollTo({ top: 800, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-white text-[#047857] hover:bg-slate-50 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Shop Under 5K</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Floating 4K Image Graphic */}
              <img
                src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80"
                alt="Budget Essentials"
                className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-2xl opacity-80 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/20 pointer-events-none"
              />
            </div>

            {/* Box 4: Official Flagships & Genuine Tech */}
            <div className="relative bg-gradient-to-br from-[#7c3aed] to-[#5b21b6] text-white rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col justify-between min-h-[200px] group border border-purple-400/30">
              <div className="relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-2.5 py-1 rounded-full border border-white/25">
                  FLAGSHIP STORE
                </span>
                <h3 className="text-2xl font-black mt-2 leading-tight">100% GENUINE BRANDS</h3>
                <p className="text-xs text-purple-100 font-medium mt-1">
                  Apple, Samsung, Sony & Dell with checking warranty
                </p>
              </div>
              <div className="relative z-10 pt-3">
                <button
                  onClick={() => {
                    onSelectCategory('mobiles-tablets');
                    window.scrollTo({ top: 800, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-white text-[#5b21b6] hover:bg-slate-50 font-black rounded-xl text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Shop Flagships</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Floating 4K Image Graphic */}
              <img
                src="https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80"
                alt="Flagships"
                className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-2xl opacity-80 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-white/20 pointer-events-none"
              />
            </div>

          </div>
        </section>
      )}

      {/* 4. MAIN PRODUCT CATALOG SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Bar: Product Count & Sort Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0f3460]">
              {selectedCategory === 'all'
                ? 'All Products (40,000+ Available)'
                : `${activeCategoryInfo?.name || selectedCategory} (${filteredProducts.length} Available)`}
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Showing {filteredProducts.length.toLocaleString()} verified products with checking warranty & COD
            </p>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-bold focus:outline-none focus:border-[#0284c7] cursor-pointer shadow-xs"
            >
              <option value="price_asc">Price: Low to High (Rs. 100 - Rs. 5,000+)</option>
              <option value="price_desc">Price: High to Low (Rs. 500,000 - Rs. 100)</option>
              <option value="featured">Featured / Best Sellers</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Stock</option>
            </select>
          </div>
        </div>

        {/* Quick Price Bracket Filter Tabs (Clean English) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-5 text-xs scrollbar-none">
          <span className="text-slate-500 font-bold shrink-0 text-[11px] pr-1">Filter by Price:</span>
          <button
            onClick={() => handlePriceBracketChange('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === 'all'
                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Products (40,000+)
          </button>
          <button
            onClick={() => handlePriceBracketChange('under5k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === 'under5k'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            🔥 Rs. 100 - Rs. 5,000 (Budget Super Deals)
          </button>
          <button
            onClick={() => handlePriceBracketChange('5k_to_25k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === '5k_to_25k'
                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rs. 5,000 - Rs. 25,000 (Mid-Range Deals)
          </button>
          <button
            onClick={() => handlePriceBracketChange('25k_to_100k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === '25k_to_100k'
                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Rs. 25,000 - Rs. 100,000 (Flagships & Laptops)
          </button>
          <button
            onClick={() => handlePriceBracketChange('100k_to_500k')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activePriceBracket === '100k_to_500k'
                ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
            }`}
          >
            Rs. 100,000 - Rs. 500,000 (Luxury Flagships)
          </button>
        </div>

        {/* Catalog Grid + Left Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-6 sticky top-28">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-black text-sm text-[#0f3460] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#0284c7]" />
                  Filters
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#0284c7] hover:underline font-bold cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Price Range Slider in PKR (Clean English) */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-700">Price Range (PKR):</span>
                  <span className="font-black text-[#0284c7]">
                    Rs. {minPrice.toLocaleString()} - Rs. {priceRange.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="500000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => {
                    setPriceRange(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#0284c7] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>Rs. 100 (Lowest)</span>
                  <span>Rs. 500,000 (Luxury)</span>
                </div>

                {/* Quick Price Buttons */}
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  <button
                    onClick={() => handlePriceBracketChange('under5k')}
                    className="p-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-center border border-emerald-200 cursor-pointer"
                  >
                    Rs. 100 - 5,000
                  </button>
                  <button
                    onClick={() => handlePriceBracketChange('100k_to_500k')}
                    className="p-1.5 rounded-lg text-[10px] font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 text-center border border-purple-200 cursor-pointer"
                  >
                    Above Rs. 100,000
                  </button>
                </div>
              </div>

              {/* Brand Filter */}
              {availableBrands.length > 0 && (
                <div>
                  <span className="font-bold text-xs text-slate-700 block mb-2">
                    Filter by Brand:
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
                    <button
                      onClick={() => {
                        setSelectedBrand('all');
                        setCurrentPage(1);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        selectedBrand === 'all'
                          ? 'bg-sky-50 text-[#0284c7] font-bold'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>All Brands</span>
                      {selectedBrand === 'all' && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {availableBrands.map((b) => (
                      <button
                        key={b}
                        onClick={() => {
                          setSelectedBrand(b);
                          setCurrentPage(1);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          selectedBrand === b
                            ? 'bg-sky-50 text-[#0284c7] font-bold'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>{b}</span>
                        {selectedBrand === b && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Badges */}
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-[11px] font-semibold text-slate-600">
                <div className="flex items-center gap-2 text-emerald-700">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Checking Warranty</span>
                </div>
                <div className="flex items-center gap-2 text-[#0284c7]">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>Fast Cash on Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700">
                  <RotateCcw className="w-4 h-4 shrink-0" />
                  <span>7-Day Return & Exchange</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Product Grid */}
          <div className="lg:col-span-9 space-y-6">
            {paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={onOpenProductDetail}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-black text-lg text-[#0f3460]">No Products Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  We could not find any products matching your current filters. Try resetting the price range or search query.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#0284c7] text-white rounded-xl text-xs font-bold hover:bg-[#0369a1] cursor-pointer shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-md"
                  >
                    Next Page
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

      </section>

      {/* MORE CATEGORIES MODAL (All 12+ Departments Taxonomy) */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-[#0f3460] flex items-center gap-2">
                  <Grid className="w-5 h-5 text-[#0284c7]" />
                  All Product Departments
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Select any category to explore products with specific brand and model filters
                </p>
              </div>
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setSelectedSubCategory('all');
                    setSelectedBrand('all');
                    setShowAllCategoriesModal(false);
                    setCurrentPage(1);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer group ${
                    selectedCategory === cat.id
                      ? 'bg-sky-50 border-[#0284c7] ring-2 ring-[#0284c7]'
                      : 'bg-white border-slate-200 hover:border-sky-300 hover:shadow-md'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 group-hover:scale-105 transition-transform">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-[#0284c7] m-auto" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-slate-900 group-hover:text-[#0284c7] leading-tight">
                      {cat.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1 font-medium">
                      {cat.subtitle || cat.description}
                    </p>
                    <span className="text-[10px] font-bold text-[#0284c7] mt-1.5 block">
                      {cat.productCount.toLocaleString()}+ items &rarr;
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowAllCategoriesModal(false)}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Departments
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
