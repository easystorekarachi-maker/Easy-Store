import React from 'react';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product, StoreViewMode } from '../types';

interface WishlistViewProps {
  products: Product[];
  onNavigate: (view: StoreViewMode) => void;
  onOpenDetail: (product: Product) => void;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  products,
  onNavigate,
  onOpenDetail,
}) => {
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] cursor-pointer mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Wishlist ({wishlistedProducts.length} Items)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Saved items for later purchase with Cash on Delivery across Pakistan.
            </p>
          </div>
        </div>

        {wishlistedProducts.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Tap the heart icon on any product to save it to your wishlist.
            </p>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {wishlistedProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between p-3.5 shadow-xs hover:shadow-md transition-shadow"
              >
                <div>
                  <div
                    className="aspect-square rounded-xl bg-slate-50 overflow-hidden mb-3 cursor-pointer relative"
                    onClick={() => onOpenDetail(p)}
                  >
                    <img 
                      src={p.images[0]} 
                      alt={p.name} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=300&q=80';
                      }}
                      className="w-full h-full object-cover" 
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(p.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-rose-500 shadow-xs cursor-pointer hover:bg-white"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3
                    onClick={() => onOpenDetail(p)}
                    className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 hover:text-[#0284c7] cursor-pointer mb-2"
                  >
                    {p.name}
                  </h3>
                  <div className="text-sm font-black text-[#dc2626] mb-3">
                    Rs. {p.price.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(p, 1)}
                  className="w-full py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Move to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
