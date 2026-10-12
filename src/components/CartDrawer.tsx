import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  Tag, 
  Check 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { StoreViewMode } from '../types';

interface CartDrawerProps {
  onNavigate: (view: StoreViewMode) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onNavigate }) => {
  const {
    items,
    itemCount,
    subtotal,
    discount,
    shippingFee,
    total,
    appliedCoupon,
    couponCodeInput,
    setCouponCodeInput,
    freeShippingThreshold,
    freeShippingProgress,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    onNavigate('checkout');
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCodeInput.trim()) {
      applyCoupon(couponCodeInput.trim());
    }
  };

  const amountNeededForFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white text-slate-800 flex flex-col shadow-2xl border-l border-slate-200">
          {/* Header */}
          <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0284c7]" />
              <h2 className="text-base font-black text-slate-900">
                My Cart ({itemCount} {itemCount === 1 ? 'Item' : 'Items'})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pakistan Free Delivery Tracker */}
          <div className="px-5 py-3 bg-sky-50 border-b border-sky-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-700">
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Free Delivery Unlocked All Over Pakistan!
                  </span>
                ) : (
                  <span>
                    Add <strong className="text-[#0284c7]">Rs. {amountNeededForFreeShip.toLocaleString()}</strong> more for Free Delivery
                  </span>
                )}
              </span>
              <span className="font-mono text-[11px] font-bold text-slate-500">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#0284c7] h-full rounded-full transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mb-5">
                  Browse over 40,000+ mobiles, electronics, fashion, and home products with Cash on Delivery.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onNavigate('catalog');
                  }}
                  className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const currentStock = item.product.stock;
                const isAtLimit = item.quantity >= currentStock;
                return (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex gap-3 relative shadow-xs"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80';
                      }}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-800 truncate">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] font-bold text-[#dc2626] mt-0.5">
                          Rs. {item.product.price.toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Stepper */}
                        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded text-slate-600 hover:bg-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            disabled={isAtLimit}
                            className="p-1 rounded text-slate-600 hover:bg-white disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total in Rs. */}
                        <span className="text-xs font-black text-slate-800">
                          Rs. {(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Calculations & Checkout Button */}
          {items.length > 0 && (
            <div className="p-4 px-5 border-t border-slate-200 bg-slate-50 space-y-3.5">
              {/* Promo code */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code}</span>
                      <span className="text-emerald-600 font-normal">({appliedCoupon.description})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-600 hover:underline text-[11px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Coupon Code (e.g. EASYSTORE)"
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase placeholder-slate-400 focus:outline-none focus:border-[#0284c7]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
              </div>

              {/* Price Breakdown in Rs. */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700">FREE DELIVERY</span>
                    ) : (
                      `Rs. ${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Order Total</span>
                  <span className="text-[#dc2626]">Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleCheckoutClick}
                className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <button onClick={clearCart} className="hover:text-rose-600 underline cursor-pointer">
                  Clear cart
                </button>
                <span>Cash on Delivery Available Across Pakistan</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
