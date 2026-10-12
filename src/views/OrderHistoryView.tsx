import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowLeft,
  X
} from 'lucide-react';
import { db } from '../services/db';
import { Order, OrderStatus, StoreViewMode } from '../types';

interface OrderHistoryViewProps {
  onNavigate: (view: StoreViewMode) => void;
  onSelectOrderForTracking: (order: Order) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  onNavigate,
  onSelectOrderForTracking,
}) => {
  const [lookupQuery, setLookupQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('all');
  const [inspectedOrder, setInspectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    setOrders(db.getOrders());
  }, []);

  const handleSearchLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const q = lookupQuery.trim();
    if (!q) {
      setOrders(db.getOrders());
      return;
    }
    const filtered = db.getOrdersByEmailOrPhone(q);
    setOrders(filtered);
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatusTab === 'all') return true;
    return o.orderStatus === selectedStatusTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pending Payment
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
            <Package className="w-3 h-3" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
            <Truck className="w-3 h-3" /> Shipped
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" /> Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3" /> Cancelled
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <button
              onClick={() => onNavigate('catalog')}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] cursor-pointer mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Orders (Pakistan)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track packages dispatched via TCS, Leopards, and CallCourier across Pakistan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('tracking')}
              className="px-4 py-2 bg-[#0284c7] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Track with Order ID
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-200 overflow-x-auto text-xs font-bold">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'processing', label: 'Processing' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`pb-3 px-3 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatusTab === tab.id
                  ? 'border-[#0284c7] text-[#0284c7]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Lookup Bar */}
        <form onSubmit={handleSearchLookup} className="flex gap-2 max-w-lg">
          <div className="relative flex-1">
            <input
              type="text"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              placeholder="Search by Order ID (e.g. ES123456) or phone..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Search
          </button>
          {lookupQuery && (
            <button
              type="button"
              onClick={() => {
                setLookupQuery('');
                setOrders(db.getOrders());
              }}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No orders found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Place your first order with Cash on Delivery or search with your Order ID.
            </p>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-5 py-2.5 bg-[#0284c7] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      #{order.orderNumber}
                    </span>
                    {getStatusBadge(order.orderStatus)}
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Items preview */}
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 text-xs">
                        <img 
                          src={it.image} 
                          alt={it.name} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80';
                          }}
                          className="w-8 h-8 rounded-lg object-cover" 
                        />
                        <div>
                          <p className="font-bold text-slate-800 truncate max-w-[150px]">{it.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {it.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.trackingNumber && (
                    <p className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>{order.carrier || 'TCS'}: {order.trackingNumber}</span>
                    </p>
                  )}
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total in PKR</span>
                    <span className="text-base font-black text-[#dc2626]">
                      Rs. {order.total.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInspectedOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onSelectOrderForTracking(order)}
                      className="px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {inspectedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono">Receipt</span>
                  <h3 className="text-lg font-black text-slate-900 font-mono">
                    #{inspectedOrder.orderNumber}
                  </h3>
                </div>
                <button onClick={() => setInspectedOrder(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-800 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-2xl">
                <p><strong>Customer:</strong> {inspectedOrder.customer.fullName} ({inspectedOrder.customer.phone})</p>
                <p><strong>Address:</strong> {inspectedOrder.customer.addressLine1}, {inspectedOrder.customer.city}</p>
                <p><strong>Payment Mode:</strong> {inspectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Mobile Account'}</p>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {inspectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <img 
                        src={it.image} 
                        alt={it.name} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=100&q=80';
                        }}
                        className="w-8 h-8 rounded-lg object-cover" 
                      />
                      <div>
                        <p className="font-bold text-slate-800">{it.name}</p>
                        <p className="text-slate-400 text-[10px]">Qty: {it.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold">Rs. {(it.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Total Paid / Due:</span>
                  <p className="text-lg font-black text-[#dc2626]">Rs. {inspectedOrder.total.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    setInspectedOrder(null);
                    onSelectOrderForTracking(inspectedOrder);
                  }}
                  className="px-5 py-2.5 bg-[#0284c7] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Live Delivery Tracking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
