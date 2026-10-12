import React from 'react';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetail }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const inWishlist = isInWishlist(product.id);

  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white border border-slate-200 hover:border-[#0284c7]/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-sky-500/10">
      <div>
        {/* Image Container with Badges */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 cursor-pointer" onClick={() => onOpenDetail(product)}>
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/easystore_card_${product.id}/400/400`;
            }}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Red discount pill */}
          {discountPercent > 0 && (
            <span className="absolute top-2.5 right-2.5 bg-[#ef4444] text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {/* Featured / Best Seller badge */}
          {product.bestSeller && (
            <span className="absolute top-2.5 left-2.5 bg-amber-500 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
              Hot Deal
            </span>
          )}
          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`absolute bottom-2.5 right-2.5 p-1.5 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-sm ${
              inWishlist
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold text-slate-500 truncate max-w-[120px]">
              {product.brand || product.category.replace('-', ' ')}
            </span>
            <span className="text-emerald-600 font-semibold text-[10px]">Official</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onOpenDetail(product)}
            className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 hover:text-[#0284c7] cursor-pointer transition-colors leading-snug mb-2 min-h-[2.4rem]"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-400 mb-2.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? 'fill-current' : 'text-slate-200 fill-current'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">({product.reviewCount})</span>
          </div>

          {/* Prices in Rs. */}
          <div className="flex flex-wrap items-baseline gap-1.5 mb-3">
            <span className="text-sm sm:text-base font-black text-[#dc2626]">
              Rs. {product.price.toLocaleString()}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                Rs. {product.compareAtPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Blue "Add to Cart" Button */}
      <div className="p-3.5 sm:p-4 pt-0">
        <button
          onClick={() => addToCart(product, 1)}
          disabled={isOutOfStock}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#0284c7] hover:bg-[#0369a1] active:scale-98 text-white shadow-sky-500/20'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{isOutOfStock ? 'Sold Out' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};
