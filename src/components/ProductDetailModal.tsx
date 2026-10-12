import React, { useState } from 'react';
import { 
  X, 
  Star, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  AlertCircle,
  Plus,
  Minus,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onBuyNow: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onBuyNow,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const maxAvailable = product.stock;

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > maxAvailable) return maxAvailable;
      return next;
    });
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const ok = addToCart(product, quantity);
    if (ok) onClose();
  };

  const handleDirectBuy = () => {
    if (isOutOfStock) return;
    onBuyNow(product, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl text-slate-800 flex flex-col max-h-[92vh] border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-100 text-[#0284c7] uppercase">
              {product.category.replace('-', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images Section */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative">
              <img
                src={product.images[selectedImageIndex] || product.images[0]}
                alt={product.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80';
                }}
                className="w-full h-full object-cover"
              />
              {discountPercent > 0 && (
                <span className="absolute top-3 left-3 bg-[#ef4444] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Pakistan Delivery Assurances */}
            <div className="grid grid-cols-3 gap-2.5 pt-1 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center gap-1">
                <Truck className="w-4 h-4 text-[#0284c7]" />
                <span className="font-bold text-slate-800 text-[11px]">Cash on Delivery</span>
                <span className="text-[10px] text-slate-500">All Pakistan</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-800 text-[11px]">100% Original</span>
                <span className="text-[10px] text-slate-500">Verified Brand</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100 flex flex-col items-center gap-1">
                <RotateCcw className="w-4 h-4 text-[#0284c7]" />
                <span className="font-bold text-slate-800 text-[11px]">7 Days Return</span>
                <span className="text-[10px] text-slate-500">Checking Warranty</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Brand & Wishlist */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                  Brand: {product.brand || 'Easy Store Verified'}
                </span>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-2 rounded-full border transition-colors cursor-pointer ${
                    inWishlist
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200 fill-current'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-slate-400">({product.reviewCount} customer reviews)</span>
              </div>

              {/* Price in Rs. */}
              <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-5">
                <span className="text-2xl sm:text-3xl font-black text-[#dc2626]">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      Rs. {product.compareAtPrice.toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Save Rs. {(product.compareAtPrice - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status in Pakistan */}
              <div className="mb-4 text-xs">
                {isOutOfStock ? (
                  <span className="text-rose-600 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Currently Out of Stock
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock in Pakistan Warehouse ({product.stock} units ready to ship)
                  </span>
                )}
              </div>

              {/* Short Description */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Technical Specifications */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mb-5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Key Specifications
                  </h4>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs divide-y divide-slate-100">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="grid grid-cols-2 py-1.5">
                        <span className="text-slate-500 font-medium">{key}</span>
                        <span className="text-slate-800 font-bold text-right">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Quantity:</span>
                  <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-xs text-slate-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= maxAvailable}
                      className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Dual CTAs: "Add to Cart" (Blue) & "Buy Now" (Orange) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock}
                  className="py-3 px-4 rounded-xl font-bold text-xs bg-[#f97316] hover:bg-[#ea580c] text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
