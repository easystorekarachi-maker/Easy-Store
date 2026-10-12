import React, { useState } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft,
  Send, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { StoreViewMode } from '../types';
import { db } from '../services/db';
import { useToast } from '../context/ToastContext';

interface SupportViewProps {
  onNavigate: (view: StoreViewMode) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Complaint Form State
  const [complaintName, setComplaintName] = useState('');
  const [complaintEmail, setComplaintEmail] = useState('');
  const [complaintPhone, setComplaintPhone] = useState('');
  const [complaintOrderNum, setComplaintOrderNum] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<'delivery_delay' | 'damaged_item' | 'wrong_product' | 'refund_request' | 'general_inquiry'>('delivery_delay');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintMessage, setComplaintMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleSubmitComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintName.trim() || !complaintEmail.trim() || !complaintMessage.trim()) {
      showToast('Required Fields', 'Please enter your name, email, and complaint message.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      db.submitComplaint({
        customerName: complaintName.trim(),
        customerEmail: complaintEmail.trim(),
        customerPhone: complaintPhone.trim() || undefined,
        orderNumber: complaintOrderNum.trim() || undefined,
        category: complaintCategory,
        subject: complaintSubject.trim() || `${complaintCategory.replace('_', ' ')} Inquiry`,
        message: complaintMessage.trim(),
      });
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      showToast('Complaint Submitted', 'Your ticket has been recorded. Our team will contact you shortly.', 'success');
      setComplaintName('');
      setComplaintEmail('');
      setComplaintPhone('');
      setComplaintOrderNum('');
      setComplaintSubject('');
      setComplaintMessage('');
    } catch {
      setIsSubmitting(false);
      showToast('Submission Failed', 'Could not record complaint. Please contact WhatsApp directly.', 'error');
    }
  };

  const faqs = [
    {
      q: 'How can I track my order?',
      a: 'You can easily track your order using the "Track Your Order" tab on the top menu. Enter your Order ID (e.g. ES123456) provided on your confirmation screen or SMS to view real-time delivery status.',
    },
    {
      q: 'What is the return policy?',
      a: 'We offer a 7-day hassle-free checking and replacement warranty on all products. If your item is damaged or not as described, contact our WhatsApp support team within 7 days of receiving the package for a prompt exchange or return.',
    },
    {
      q: 'Do you offer Cash on Delivery (COD) all over Pakistan?',
      a: 'Yes! We deliver via Cash on Delivery (COD) to all cities, towns, and villages across Pakistan through our trusted courier partners TCS, Leopards, and Trax.',
    },
    {
      q: 'How long does shipping take?',
      a: 'Orders within major cities (Karachi, Lahore, Islamabad, Rawalpindi) are delivered within 2 to 3 working days. Other regions typically take 3 to 4 working days.',
    },
    {
      q: 'How can I get a refund or cancellation?',
      a: 'If you wish to cancel an order before dispatch, message us on WhatsApp with your Order ID. For delivered returns, refunds are sent directly to your JazzCash, EasyPaisa, or Bank Account within 24 to 48 hours of return receipt.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-10 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] cursor-pointer mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            24/7 Customer Support
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            We&apos;re always here to help you across Pakistan. Reach out via Live WhatsApp, phone or email.
          </p>
        </div>

        {/* 4 Support Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Channel 1: Live Chat */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Live Web Chat</h3>
              <p className="text-xs text-slate-500 mt-1">
                Chat with our online store support representative instantly.
              </p>
            </div>
            <button
              onClick={() => alert('Live web chat agent connecting... You can also message directly on WhatsApp: +92 346 7792177')}
              className="mt-4 w-full py-2 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Start Chat
            </button>
          </div>

          {/* Channel 2: WhatsApp */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <span className="text-lg">💬</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">WhatsApp Support</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono font-bold">
                +92 346 7792177
              </p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                Instant reply within 5 mins
              </p>
            </div>
            <a
              href="https://wa.me/923467792177"
              target="_blank"
              rel="noreferrer"
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors text-center block cursor-pointer"
            >
              Open WhatsApp
            </a>
          </div>

          {/* Channel 3: Email */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Email Us</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono truncate">
                easystorekarachi@gmail.com
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Official queries &amp; corporate
              </p>
            </div>
            <a
              href="mailto:easystorekarachi@gmail.com"
              className="mt-4 w-full py-2 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-xl text-xs font-bold transition-colors text-center block cursor-pointer"
            >
              Send Email
            </a>
          </div>

          {/* Channel 4: Call Us */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0284c7] flex items-center justify-center mb-3">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Call Helpline</h3>
              <p className="text-xs text-slate-500 mt-1 font-mono font-bold">
                +92 346 7792177
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Mon - Sat (9am - 9pm PKT)
              </p>
            </div>
            <a
              href="tel:+923467792177"
              className="mt-4 w-full py-2 bg-sky-50 hover:bg-sky-100 text-[#0284c7] rounded-xl text-xs font-bold transition-colors text-center block cursor-pointer"
            >
              Call Now
            </a>
          </div>
        </div>

        {/* Customer Complaint & Inquiries Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Register a Complaint or Inquiry
                </h2>
                <p className="text-xs text-slate-500">
                  Facing any issue with delivery, damaged items, or wrong orders? Submit a ticket and our management will address it promptly.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Guaranteed Response within 24h
            </span>
          </div>

          {submittedSuccess ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-base text-emerald-900">
                Complaint Successfully Recorded!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Thank you for contacting Easy Store. Our customer dispute resolution team has logged your complaint in our administration portal. You will receive an update via WhatsApp or email shortly.
              </p>
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={complaintName}
                    onChange={(e) => setComplaintName(e.target.value)}
                    placeholder="e.g. Muhammad Usman"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email / Gmail Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={complaintEmail}
                    onChange={(e) => setComplaintEmail(e.target.value)}
                    placeholder="customer@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={complaintPhone}
                    onChange={(e) => setComplaintPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Order ID (if applicable)
                  </label>
                  <input
                    type="text"
                    value={complaintOrderNum}
                    onChange={(e) => setComplaintOrderNum(e.target.value)}
                    placeholder="e.g. ES123456"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Complaint Category *
                  </label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="delivery_delay">Delivery Delay</option>
                    <option value="damaged_item">Damaged or Broken Item</option>
                    <option value="wrong_product">Wrong Product Received</option>
                    <option value="refund_request">Refund / Return Request</option>
                    <option value="general_inquiry">General Inquiry / Feedback</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Package arrived with broken seal or delayed delivery"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Explanation *
                </label>
                <textarea
                  required
                  rows={4}
                  value={complaintMessage}
                  onChange={(e) => setComplaintMessage(e.target.value)}
                  placeholder="Please describe what happened with your product or courier so we can resolve it immediately..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-500/25 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Submit Complaint Ticket</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-[#0284c7]" />
            <h2 className="text-lg font-black text-slate-900">
              Frequently Asked Questions (FAQs)
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-[#0284c7] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#0284c7]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-2.5 pl-0.5 animate-in fade-in">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
