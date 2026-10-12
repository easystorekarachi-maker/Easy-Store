import React, { useState } from 'react';
import { 
  Truck, 
  Search, 
  AlertCircle, 
  ArrowLeft
} from 'lucide-react';
import { db } from '../services/db';
import { Order, OrderStatus, StoreViewMode } from '../types';

interface TrackingViewProps {
  onNavigate: (view: StoreViewMode) => void;
  onSelectOrderForDetails: (order: Order) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({ onNavigate, onSelectOrderForDetails }) => {
  const [orderQuery, setOrderQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;
    const res = db.getOrderById(orderQuery.trim());
    setFoundOrder(res);
    setSearchAttempted(true);
  };

  const trackingSteps = [
    { title: 'Order Placed', desc: 'Order verified by Easy Store', status: 'pending_payment' },
    { title: 'Packed & Processed', desc: 'Dispatched to logistics center', status: 'processing' },
    { title: 'Shipped & En Route', desc: 'Handed over to TCS / Leopards Courier', status: 'shipped' },
    { title: 'Out for Delivery', desc: 'Rider is on the way to your doorstep', status: 'out_for_delivery' },
    { title: 'Delivered', desc: 'Handed over to customer', status: 'delivered' },
  ];

  const getStepActiveIndex = (status?: OrderStatus) => {
    if (!status) return 0;
    switch (status) {
      case 'pending_payment': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'out_for_delivery': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const activeIdx = foundOrder ? getStepActiveIndex(foundOrder.orderStatus) : 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
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
              Track Your Order
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your Easy Store Order ID to view real-time delivery and courier progress across Pakistan.
            </p>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <form onSubmit={handleTrackSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
                placeholder="Enter Order ID (e.g. ES123456)"
                className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-xs sm:text-sm font-mono text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-[#0284c7]"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-sky-500/20 cursor-pointer transition-all"
            >
              Track
            </button>
          </form>
        </div>

        {/* Results */}
        {foundOrder ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-8 shadow-xs">
            {/* Order Brief */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Order Number
                </span>
                <h3 className="text-xl font-black text-slate-900 font-mono">
                  #{foundOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Placed on {new Date(foundOrder.createdAt).toLocaleDateString()} • {foundOrder.customer.city}, Pakistan
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-[#0284c7] capitalize">
                  {foundOrder.orderStatus.replace('_', ' ')}
                </span>
                <button
                  onClick={() => onSelectOrderForDetails(foundOrder)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  View Full Receipt
                </button>
              </div>
            </div>

            {/* Courier Tracking Details */}
            {foundOrder.trackingNumber && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#0284c7] flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      Carrier: {foundOrder.carrier || 'TCS Express Pakistan'}
                    </span>
                    <span className="font-mono text-[#0284c7] font-bold text-sm block">
                      Tracking ID: {foundOrder.trackingNumber}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Verified Dispatch across Pakistan
                </span>
              </div>
            )}

            {/* Stepper */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-6">
                Delivery Timeline
              </h4>
              <div className="space-y-6 relative pl-6 sm:pl-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {trackingSteps.map((step, idx) => {
                  const isDone = activeIdx >= idx;
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isDone
                            ? 'bg-[#0284c7] text-white ring-4 ring-sky-100'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <div>
                        <h5 className={`text-xs sm:text-sm font-bold ${isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                          {step.title}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Destination */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Shipping To:</span>
                <p className="font-bold text-slate-900">{foundOrder.customer.fullName}</p>
                <p className="text-slate-600">{foundOrder.customer.addressLine1}</p>
                <p className="text-slate-600">{foundOrder.customer.city}, {foundOrder.customer.country}</p>
                <p className="text-slate-600 mt-1">Phone: {foundOrder.customer.phone}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Payment Mode:</span>
                <p className="font-bold text-[#0284c7] capitalize">
                  {foundOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Mobile Wallet'}
                </p>
                <p className="font-black text-slate-900 text-base mt-2">
                  Total: Rs. {foundOrder.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ) : searchAttempted ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No order found matching &quot;{orderQuery}&quot;</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Please ensure your Order ID starts with ES followed by 6 digits (e.g. ES123456).
            </p>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-5 py-2.5 bg-[#0284c7] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Back to Catalog
            </button>
          </div>
        ) : (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
            <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium">Enter your Order ID above to track delivery status.</p>
          </div>
        )}
      </div>
    </div>
  );
};
