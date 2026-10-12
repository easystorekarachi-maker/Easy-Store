import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { CartItem, Coupon, Product } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  appliedCoupon: Coupon | null;
  couponCodeInput: string;
  setCouponCodeInput: (code: string) => void;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, quantity?: number) => boolean;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const STORAGE_KEYS = {
  CART: 'easystore_pk_cart_items_v5',
  COUPON: 'easystore_pk_applied_coupon_v5',
  WISHLIST: 'easystore_pk_wishlist_v5',
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const settings = db.getAdminSettings();
  const freeShippingThreshold = settings.freeShippingThreshold;

  // Restore state
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem(STORAGE_KEYS.COUPON);
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
      const savedWishlist = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (e) {
      console.error('Failed to load cart state', e);
    }
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(newItems));
  };

  const addToCart = (product: Product, quantity: number = 1): boolean => {
    const currentDbProd = db.getProductById(product.id) || product;
    if (currentDbProd.stock <= 0) {
      showToast('Out of Stock', `"${product.name}" is currently sold out.`, 'error');
      return false;
    }

    const existingIndex = items.findIndex((i) => i.product.id === product.id);
    let updated: CartItem[];

    if (existingIndex !== -1) {
      const currentQty = items[existingIndex].quantity;
      const newQty = currentQty + quantity;
      if (newQty > currentDbProd.stock) {
        showToast(
          'Maximum Stock Reached',
          `Only ${currentDbProd.stock} units available in stock.`,
          'error'
        );
        return false;
      }
      updated = [...items];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        product: currentDbProd,
      };
    } else {
      if (quantity > currentDbProd.stock) {
        showToast(
          'Insufficient Stock',
          `Only ${currentDbProd.stock} units available.`,
          'error'
        );
        return false;
      }
      updated = [
        ...items,
        {
          product: currentDbProd,
          quantity,
          addedAt: new Date().toISOString(),
        },
      ];
    }

    saveCart(updated);
    showToast('Added to Cart', `${product.name} (x${quantity}) added.`, 'success');
    return true;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const currentDbProd = db.getProductById(productId);
    const maxStock = currentDbProd ? currentDbProd.stock : 999;
    if (quantity > maxStock) {
      showToast('Stock Limit', `Cannot exceed available inventory (${maxStock}).`, 'error');
      quantity = maxStock;
    }
    const updated = items.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(updated);
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = items.find((i) => i.product.id === productId);
    const updated = items.filter((i) => i.product.id !== productId);
    saveCart(updated);
    if (itemToRemove) {
      showToast('Item Removed', `${itemToRemove.product.name} removed from cart.`, 'info');
    }
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    localStorage.removeItem(STORAGE_KEYS.COUPON);
  };

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const currentSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const res = db.validateCoupon(code, currentSubtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      localStorage.setItem(STORAGE_KEYS.COUPON, JSON.stringify(res.coupon));
      setCouponCodeInput('');
      showToast('Coupon Applied!', res.message, 'success');
      return { success: true, message: res.message };
    } else {
      showToast('Coupon Error', res.message, 'error');
      return { success: false, message: res.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem(STORAGE_KEYS.COUPON);
    showToast('Coupon Removed', 'Promo code removed from cart.', 'info');
  };

  const toggleWishlist = (productId: string) => {
    let updated: string[];
    if (wishlist.includes(productId)) {
      updated = wishlist.filter((id) => id !== productId);
      showToast('Wishlist', 'Item removed from saved wishlist.', 'info');
    } else {
      updated = [...wishlist, productId];
      showToast('Wishlist', 'Item saved to your wishlist!', 'success');
    }
    setWishlist(updated);
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  // Calculations in PKR Rs.
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercentage) {
      discount = Math.round((subtotal * appliedCoupon.discountPercentage) / 100);
    } else if (appliedCoupon.discountFixed) {
      discount = Math.min(appliedCoupon.discountFixed, subtotal);
    }
  }

  const isFreeShipping =
    subtotal === 0 ||
    appliedCoupon?.code === 'FREESHIP' ||
    subtotal >= freeShippingThreshold;

  const shippingFee = isFreeShipping ? 0 : settings.shippingFlatRate;
  const tax = 0; // Tax-free retail in Pakistan
  const total = Math.max(0, subtotal - discount + shippingFee);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        discount,
        shippingFee,
        tax,
        total,
        appliedCoupon,
        couponCodeInput,
        setCouponCodeInput,
        freeShippingThreshold,
        freeShippingProgress,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
