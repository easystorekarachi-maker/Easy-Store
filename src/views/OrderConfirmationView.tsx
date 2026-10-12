import React from 'react';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Printer, 
  Clock, 
  Receipt, 
  Check 
} from 'lucide-react';
import { Order, OrderStatus, StoreViewMode } from '../types';

interface OrderConfirmationViewProps {
  order: Order | null;
  onNavigate: (view: StoreViewMode) => void;
}

export const OrderConfirmationView: React.FC<OrderConfirmationViewProps> = ({ order, onNavigate }) => {
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-slate-800">
        <h2 className="text-xl font-bold mb-2">No active order session found</h2>
        <p className="text-xs text-slate-500 mb-6">You can lookup any past orders in your Order History.</p>
        <button
          onClick={() => onNavigate('order_history')}
          className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Go to Order History
        </button>
      </div>
    );
  }

  const steps: Array<{ status: OrderStatus; label: string; icon: any }> = [
    { status: 'pending_payment', label: 'Order Placed', icon: Clock },
    { status: 'processing', label: 'Processing & Packed', icon: Package },
    { status: 'shipped', label: 'Shipped & En Route', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_payment': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      case 'cancelled': return -1;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Success Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 text-center shadow-sm print:border-none print:shadow-none print:p-0 space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50 print:hidden">
            <Check className="w-10 h-10 stroke-[3]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 print:text-black">
            Order Placed Successfully!
          </h1>
          
          <div className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto space-y-1">
            <p>
              Your order <strong className="font-mono text-slate-900 font-black">#{order.orderNumber}</strong> has been placed.
            </p>
            <p className="text-slate-500">
              We will notify you via SMS and Email on dispatch.
            </p>
            <p className="text-emerald-700 font-bold flex items-center justify-center gap-1.5 pt-1">
              <Truck className="w-4 h-4" /> Estimated Delivery: 2-4 Days
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 print:hidden">
            <button
              onClick={() => onNavigate('order_history')}
              className="px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              View Order Details
            </button>
            <button
              onClick={() => onNavigate('catalog')}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Live Order Timeline */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Order Delivery Status</h3>
              <p className="text-xs text-slate-500">Live dispatch updates from Pakistan logistics hub</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-sky-100 text-[#0284c7] font-mono capitalize">
              {order.orderStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {steps.map((st, idx) => {
              const IconComponent = st.icon;
              const isCompleted = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div
                  key={st.status}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
                    isCompleted
                      ? 'bg-sky-50 border-[#0284c7] text-[#0284c7]'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } ${isCurrent ? 'ring-2 ring-[#0284c7]' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isCompleted ? 'bg-[#0284c7] text-white' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold">{st.label}</span>
                  <span className="text-[10px] opacity-80">
                    {isCompleted ? (isCurrent ? 'In Progress' : 'Completed') : 'Upcoming'}
                  </span>
                </div>
              );
            })}
          </div>

          {order.trackingNumber && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-800 block">
                  Carrier Partner: {order.carrier || 'TCS Express Pakistan'}
                </span>
                <span className="font-mono text-[#0284c7] font-bold text-sm mt-0.5 block">
                  Tracking Code: {order.trackingNumber}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Track directly via TCS / Leopards Courier
              </span>
            </div>
          )}
        </div>

        {/* Order Details & Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Delivery Info */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0284c7]" />
              Delivery &amp; Contact Details
            </h3>
            <div className="text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-900 text-sm">{order.customer.fullName}</p>
              <p>{order.customer.phone}</p>
              <p>{order.customer.email}</p>
              <div className="pt-2 border-t border-slate-100 text-slate-700">
                <p>{order.customer.addressLine1}</p>
                {order.customer.addressLine2 && <p>{order.customer.addressLine2}</p>}
                <p>{order.customer.city}, {order.customer.province} {order.customer.postalCode}</p>
                <p>{order.customer.country}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400 block text-[11px]">Payment Mode:</span>
              <span className="font-bold text-[#0284c7] capitalize">
                {order.paymentMethod === 'cod'
                  ? 'Cash on Delivery (Pay rider in PKR upon arrival)'
                  : order.paymentMethod === 'jazzcash_easypaisa'
                  ? `JazzCash / EasyPaisa (${order.mobileWalletNumber || 'Provided'})`
                  : 'Bank Wire Transfer'}
              </span>
            </div>
          </div>

          {/* Purchased Line Items */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#0284c7]" />
              Order Items ({order.items.length})
            </h3>
            <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80';
                    }}
                    className="w-11 h-11 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">{item.name}</p>
                    <p className="text-slate-400 text-[10px]">Qty: {item.quantity} × Rs. {item.price.toLocaleString()}</p>
                  </div>
                  <span className="font-black text-slate-900">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>-Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-bold text-slate-800">
                  {order.shippingFee === 0 ? 'FREE' : `Rs. ${order.shippingFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Amount Due</span>
                <span className="text-[#dc2626]">Rs. {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
