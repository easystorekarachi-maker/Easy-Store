import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Banknote, 
  Building2, 
  Smartphone, 
  CheckCircle2, 
  Lock, 
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/db';
import { Order, PaymentMethod, ShippingAddress, StoreViewMode } from '../types';

interface CheckoutViewProps {
  onNavigate: (view: StoreViewMode) => void;
  onOrderSuccess: (order: Order) => void;
}

const PAKISTAN_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Gujranwala',
  'Sialkot',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Abbottabad',
  'Sukkur',
  'Gujrat',
  'Mardan',
  'Kasur',
  'Rahim Yar Khan',
  'Sahiwal',
  'Okara',
  'Wah Cantt',
  'Dera Ghazi Khan',
  'Mirpur (AJK)',
  'Muzaffarabad (AJK)',
  'Gilgit',
  'Swat',
];

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate, onOrderSuccess }) => {
  const { items, subtotal, discount, appliedCoupon, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<ShippingAddress>({
    fullName: user?.address?.fullName || user?.name || 'Muhammad Ali',
    email: user?.address?.email || user?.email || 'customer@gmail.com',
    phone: user?.address?.phone || user?.phone || '+92 300 1234567',
    addressLine1: user?.address?.addressLine1 || 'House # 12, Street 3, Clifton Block 5',
    addressLine2: user?.address?.addressLine2 || 'Near Bilawal House',
    city: user?.address?.city || 'Karachi',
    province: user?.address?.province || 'Sindh',
    postalCode: user?.address?.postalCode || '75600',
    country: 'Pakistan',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [mobileWalletNumber, setMobileWalletNumber] = useState(user?.phone || '03001234567');
  const [bankWireReference, setBankWireReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStripeConfigured = Boolean(
    import.meta.env.VITE_STRIPE_PUBLIC_KEY &&
    !import.meta.env.VITE_STRIPE_PUBLIC_KEY.includes('PLACEHOLDER')
  );

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required for courier delivery.';
    }
    if (!formData.addressLine1.trim()) errors.addressLine1 = 'Delivery address is required.';
    if (!formData.city.trim()) errors.city = 'City is required.';
    if (paymentMethod === 'jazzcash_easypaisa' && !mobileWalletNumber.trim()) {
      errors.mobileWallet = 'Please enter your JazzCash or EasyPaisa mobile number.';
    }
    if (paymentMethod === 'bank_transfer' && !bankWireReference.trim()) {
      errors.bankReference = 'Bank transfer transaction ID or reference is required.';
    }
    if (paymentMethod === 'stripe' && !isStripeConfigured) {
      errors.paymentMethod = 'Online card processing requires API credentials. Please select Cash on Delivery or JazzCash/EasyPaisa.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Empty Cart', 'Your shopping cart is empty.', 'error');
      return;
    }
    if (!validate()) {
      showToast('Form Error', 'Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = db.createOrder({
      customer: formData,
      userId: user?.id,
      items: items.map((i) => ({
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        image: i.product.images[0] || '',
        sku: i.product.sku,
      })),
      subtotal,
      discount,
      discountCode: appliedCoupon?.code,
      shippingFee,
      estimatedTax: 0,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'verification_required',
      paymentReference: paymentMethod === 'bank_transfer' ? bankWireReference.trim() : undefined,
      mobileWalletNumber: paymentMethod === 'jazzcash_easypaisa' ? mobileWalletNumber.trim() : undefined,
      customerNotes: customerNotes.trim() || undefined,
      orderStatus: 'pending_payment',
    });
    setIsSubmitting(false);

    if (result.success && result.order) {
      clearCart();
      showToast('Order Placed!', `Your order #${result.order.orderNumber} is confirmed.`, 'success');
      onOrderSuccess(result.order);
    } else {
      showToast('Order Failed', result.error || 'Failed to place order.', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold mb-2">Your shopping cart is empty</h2>
        <p className="text-xs text-slate-500 mb-6">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-6 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-[#0284c7] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 256-Bit SSL Checkout Pakistan</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Step 1: Shipping Address */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    Shipping Address (Pakistan)
                  </h3>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> 2-4 Days Delivery
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Muhammad Ali"
                      className={`w-full bg-slate-50 border ${
                        formErrors.fullName ? 'border-rose-500' : 'border-slate-200'
                      } rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]`}
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number (Active for Courier Call) *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                      className={`w-full bg-slate-50 border ${
                        formErrors.phone ? 'border-rose-500' : 'border-slate-200'
                      } rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (for Receipt & Tracking updates)
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="customer@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      House #, Street / Colony / Sector *
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="House # 12, Street 3, Clifton Block 5"
                      className={`w-full bg-slate-50 border ${
                        formErrors.addressLine1 ? 'border-rose-500' : 'border-slate-200'
                      } rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]`}
                    />
                    {formErrors.addressLine1 && (
                      <p className="text-[11px] text-rose-500 mt-1">{formErrors.addressLine1}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City *
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] cursor-pointer"
                    >
                      {PAKISTAN_CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nearby Landmark / Instructions
                    </label>
                    <input
                      type="text"
                      value={formData.addressLine2 || ''}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Near Main Market / Bank"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Method */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    Payment Method
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your preferred payment option across Pakistan.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-sky-50/70 border-[#0284c7] shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 accent-[#0284c7] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                            <Banknote className="w-4 h-4 text-emerald-600" />
                            Cash on Delivery (COD)
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Most Popular in Pakistan
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Pay in cash when you receive your order at your doorstep. No advance payment required.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Option 2: JazzCash / EasyPaisa */}
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'jazzcash_easypaisa'
                        ? 'bg-sky-50/70 border-[#0284c7] shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="jazzcash_easypaisa"
                        checked={paymentMethod === 'jazzcash_easypaisa'}
                        onChange={() => setPaymentMethod('jazzcash_easypaisa')}
                        className="mt-1 accent-[#0284c7] cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-[#ec4899]" />
                          EasyPaisa / JazzCash Mobile Payment
                        </span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Fast mobile wallet transfer from your mobile app.
                        </p>
                        {paymentMethod === 'jazzcash_easypaisa' && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                            <div className="text-[11px] font-bold text-slate-700">
                              Easy Store Merchant Mobile Accounts:
                            </div>
                            <div className="text-xs text-slate-600 space-y-1">
                              <p>• <strong>JazzCash Account:</strong> 0346 7792177 (Title: Easy Store)</p>
                              <p>• <strong>EasyPaisa Account:</strong> 0346 7792177 (Title: Easy Store)</p>
                            </div>
                            <div className="pt-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Your Mobile Wallet Number (03XX XXXXXXX) *
                              </label>
                              <input
                                type="text"
                                value={mobileWalletNumber}
                                onChange={(e) => setMobileWalletNumber(e.target.value)}
                                placeholder="03001234567"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Option 3: Direct Bank Wire */}
                  <label
                    className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'bank_transfer'
                        ? 'bg-sky-50/70 border-[#0284c7] shadow-sm'
                        : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-1 accent-[#0284c7] cursor-pointer"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#0284c7]" />
                          Bank Transfer (Meezan / HBL / MCB)
                        </span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          Direct online transfer to Easy Store official company bank account in Pakistan.
                        </p>
                        {paymentMethod === 'bank_transfer' && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
                              <span>Bank Name:</span>
                              <span className="font-bold text-slate-800">Meezan Bank Limited</span>
                              <span>Account Title:</span>
                              <span className="font-bold text-slate-800">Easy Store Pakistan Pvt Ltd</span>
                              <span>IBAN:</span>
                              <span className="font-mono text-slate-800">PK89MEZN0001928374829102</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Transfer Transaction ID / Reference Code *
                              </label>
                              <input
                                type="text"
                                value={bankWireReference}
                                onChange={(e) => setBankWireReference(e.target.value)}
                                placeholder="e.g. TRX-98241"
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Option 4: Debit/Credit Card */}
                  <label
                    className={`block p-4 rounded-xl border transition-all ${
                      paymentMethod === 'stripe'
                        ? 'bg-sky-50/70 border-[#0284c7]'
                        : 'bg-slate-50/50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="stripe"
                        checked={paymentMethod === 'stripe'}
                        onChange={() => setPaymentMethod('stripe')}
                        className="mt-1 accent-[#0284c7] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#0284c7]" />
                            Credit / Debit Card (Visa, MasterCard, UnionPay)
                          </span>
                          {!isStripeConfigured && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                              Requires Setup
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Online card processing. If unconfigured, please select Cash on Delivery or JazzCash.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Special Delivery Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Call before delivery, leave with neighbor if unavailable..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>

              {/* Submit CTA */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || (paymentMethod === 'stripe' && !isStripeConfigured)}
                  className="w-full py-4 px-6 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Confirming your order...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-white" />
                      <span>Place Order (Rs. {total.toLocaleString()})</span>
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-slate-400">
                  By placing order, you agree to our Terms &amp; Conditions and 7-Day Return Policy.
                </p>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24 space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">Order Summary</h3>
                <span className="text-xs text-slate-500">{items.length} Unique Items</span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80';
                      }}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.product.name}</p>
                      <p className="text-slate-400 text-[11px]">Qty: {item.quantity} × Rs. {item.product.price.toLocaleString()}</p>
                    </div>
                    <span className="font-mono font-black text-slate-800">
                      Rs. {(item.product.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations in Rs. */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-800">Rs. {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Discount Coupon</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE DELIVERY</span>
                    ) : (
                      `Rs. ${shippingFee.toLocaleString()}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Total Due</span>
                  <span className="text-[#dc2626] font-mono text-lg">
                    Rs. {total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Perks */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1.5 font-medium">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cash on Delivery with 7-Days Checking Warranty</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Truck className="w-4 h-4 text-[#0284c7]" />
                  <span>Fast delivery across Pakistan via TCS &amp; Leopards</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
