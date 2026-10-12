import React from 'react';
import { 
  ShoppingCart, 
  Send 
} from 'lucide-react';
import { StoreViewMode } from '../types';
import { OwnerAvatar } from './OwnerAvatar';

interface FooterProps {
  onNavigate: (view: StoreViewMode) => void;
  onOpenAdminGate: () => void;
  onOpenAppDownload?: (tab: 'google_play' | 'app_store' | 'direct_apk') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAdminGate, onOpenAppDownload }) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      {/* 1. Mobile App Promo Banner */}
      <div className="bg-gradient-to-r from-[#0284c7] via-[#0369a1] to-[#0f3460] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-sky-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Mobile App Experience • پاکستان موبائل ایپ
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              Easy Store Mobile App
            </h3>
            <p className="text-xs text-sky-100 max-w-lg leading-relaxed">
              Shop anytime, anywhere across Pakistan with exclusive app vouchers, faster Cash on Delivery checkout, and live courier tracking.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-white/90 pt-1">
              <span>✦ Exclusive App Deals</span>
              <span>✦ Faster 1-Click Checkout</span>
              <span>✦ Live Order Tracking</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {/* Google Play Button */}
            <button
              onClick={() => onOpenAppDownload?.('google_play')}
              className="bg-black/90 hover:bg-black text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl cursor-pointer transition-transform hover:scale-105 border border-white/20"
              title="Get it on Google Play"
            >
              <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3.6 2.4l10.8 10.8-3.4 3.4L3.6 2.4z"/>
                <path fill="#FBBC05" d="M17.8 8.8L14.4 12l3.4 3.4 2.8-1.6c.9-.5.9-1.4 0-1.9l-2.8-3.1z"/>
                <path fill="#EA4335" d="M14.4 12L3.6 21.6c.3.1.6.1.9 0l9.9-9.6z"/>
                <path fill="#34A853" d="M4.5 2.4c-.3-.1-.6-.1-.9 0L14.4 12 4.5 2.4z"/>
              </svg>
              <div className="text-left leading-tight">
                <span className="text-[9px] block text-slate-300 uppercase tracking-wider font-semibold">GET IT ON</span>
                <span className="text-sm font-black text-white">Google Play</span>
              </div>
            </button>

            {/* Apple App Store Button */}
            <button
              onClick={() => onOpenAppDownload?.('app_store')}
              className="bg-black/90 hover:bg-black text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl cursor-pointer transition-transform hover:scale-105 border border-white/20"
              title="Download on the App Store"
            >
              <span className="text-2xl leading-none">🍎</span>
              <div className="text-left leading-tight">
                <span className="text-[9px] block text-slate-300 uppercase tracking-wider font-semibold">Download on the</span>
                <span className="text-sm font-black text-white">App Store</span>
              </div>
            </button>

            {/* Direct APK Download Quick Action */}
            <button
              onClick={() => onOpenAppDownload?.('direct_apk')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-2xl flex items-center gap-2 shadow-xl cursor-pointer transition-transform hover:scale-105 font-bold text-xs"
              title="Download APK Direct for Android"
            >
              <span>📥 Download APK</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">v5.2</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0284c7] flex items-center justify-center text-white shadow-md">
              <ShoppingCart className="w-5 h-5 stroke-[2.3]" />
            </div>
            <div>
              <span className="text-xl font-black text-[#0f3460] tracking-tight">
                Easy <span className="text-[#0284c7]">Store</span>
              </span>
              <span className="text-[10px] block font-bold text-slate-400">
                Har Cheez Asaan, Har Ghar Tak
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            Pakistan&apos;s trusted online shopping destination for mobiles, laptops, electronics, cameras, fashion, home &amp; living with authentic guarantees and Cash on Delivery.
          </p>

          {/* Founder & Store Owner Profile Card */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-sm shadow-xs">
            <OwnerAvatar size="lg" className="ring-2 ring-[#0284c7]" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-xs">Abdullah</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-[#0284c7]">
                  Founder &amp; Owner
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                Easy Store Pakistan
              </p>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <p><strong>WhatsApp &amp; Helpline:</strong> +92 346 7792177</p>
            <p><strong>Support Email:</strong> easystorekarachi@gmail.com</p>
            <p><strong>Head Office:</strong> Tech Plaza, Gulberg III, Lahore, Pakistan</p>
          </div>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3.5">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('catalog')} className="hover:text-[#0284c7] cursor-pointer">
                All Products (4,850+)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('tracking')} className="hover:text-[#0284c7] cursor-pointer font-semibold text-[#0284c7]">
                Track Your Order (ID)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('order_history')} className="hover:text-[#0284c7] cursor-pointer">
                My Order History
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('wishlist')} className="hover:text-[#0284c7] cursor-pointer">
                Saved Wishlist
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('support')} className="hover:text-[#0284c7] cursor-pointer">
                Contact &amp; Support
              </button>
            </li>
          </ul>
        </div>

        {/* Customer Service Column */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3.5">
            Customer Service
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => onNavigate('support')} className="hover:text-[#0284c7] cursor-pointer">
                7 Days Return Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('support')} className="hover:text-[#0284c7] cursor-pointer">
                Shipping &amp; Delivery Info
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('support')} className="hover:text-[#0284c7] cursor-pointer">
                Cash on Delivery FAQs
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('support')} className="hover:text-[#0284c7] cursor-pointer">
                Warranty Claim Process
              </button>
            </li>
            <li>
              <button onClick={onOpenAdminGate} className="hover:text-amber-600 font-bold cursor-pointer text-slate-500">
                Admin Management Portal
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter & Pakistan Payments */}
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3.5">
            Stay Updated
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            Subscribe for exclusive flash sales, discount coupons, and new tech launches.
          </p>
          <div className="flex gap-1.5 mb-4">
            <input
              type="email"
              placeholder="Your email address"
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] flex-1"
            />
            <button
              onClick={() => alert('Subscribed to Easy Store Pakistan discount alerts!')}
              className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] space-y-1">
            <span className="font-bold text-slate-700 block">Accepted Payment Modes:</span>
            <div className="flex flex-wrap gap-1.5 text-slate-600 pt-1">
              <span className="bg-white border px-1.5 py-0.5 rounded font-bold text-[10px]">Cash on Delivery</span>
              <span className="bg-white border px-1.5 py-0.5 rounded font-bold text-[10px] text-pink-600">JazzCash</span>
              <span className="bg-white border px-1.5 py-0.5 rounded font-bold text-[10px] text-emerald-600">EasyPaisa</span>
              <span className="bg-white border px-1.5 py-0.5 rounded font-bold text-[10px]">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-slate-200 bg-slate-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 Easy Store Pakistan (Pvt.) Ltd. Har Cheez Asaan, Har Ghar Tak. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <span>Official Pakistan E-Commerce Platform</span>
            <span>•</span>
            <button onClick={onOpenAdminGate} className="hover:text-slate-800 font-semibold cursor-pointer">
              Admin Gateway
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
