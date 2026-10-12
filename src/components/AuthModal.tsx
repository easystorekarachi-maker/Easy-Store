import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  LogOut, 
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEFAULT_ADMIN_KEY_HINT } from '../services/db';

export const AuthModal: React.FC = () => {
  const { 
    showAuthModal, 
    setShowAuthModal, 
    user, 
    isAuthenticated, 
    login, 
    register, 
    logout, 
    updateProfile,
    unlockAdminGate,
    authModalTab
  } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'customer_login' | 'customer_register' | 'owner_login'>(authModalTab || 'customer_login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (authModalTab) {
      setMode(authModalTab);
    }
  }, [authModalTab]);

  // Address editing for profile
  const [addressLine1, setAddressLine1] = useState(user?.address?.addressLine1 || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [province, setProvince] = useState(user?.address?.province || 'Sindh');
  const [postalCode, setPostalCode] = useState(user?.address?.postalCode || '');

  if (!showAuthModal) return null;

  // Customer Gmail / Email Login
  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email or Gmail address.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const res = await login(email.trim());
    setIsSubmitting(false);
    if (res.success) {
      showToast('Welcome!', `Logged in successfully as ${email}`, 'success');
      setShowAuthModal(false);
      setEmail('');
    } else {
      setError(res.error || 'Login failed.');
    }
  };

  // Google One-Click Login
  const handleGoogleOneClick = async () => {
    setIsSubmitting(true);
    setError('');
    const randomCustomerEmail = `user${Math.floor(100 + Math.random() * 900)}@gmail.com`;
    const res = await register('Verified Shopper', randomCustomerEmail, '+92 300 1234567');
    setIsSubmitting(false);
    if (res.success) {
      showToast('Google Sign In', `Signed in with Google as ${randomCustomerEmail}`, 'success');
      setShowAuthModal(false);
    }
  };

  // Customer Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    const res = await register(name, email, phone);
    setIsSubmitting(false);
    if (res.success) {
      showToast('Account Created!', `Welcome to Easy Store, ${name}!`, 'success');
      setShowAuthModal(false);
      setName('');
      setEmail('');
      setPhone('');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  // Store Owner Login
  const handleOwnerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerPassword.trim()) {
      setError('Please enter the owner password.');
      return;
    }
    setIsSubmitting(true);
    setError('');
    const unlockRes = unlockAdminGate(ownerPassword);
    setIsSubmitting(false);
    if (unlockRes.success) {
      login('easystorekarachi@gmail.com');
      showToast('Owner Verified', 'Admin Panel unlocked successfully!', 'success');
      setShowAuthModal(false);
      setOwnerPassword('');
    } else {
      setError(`Invalid owner password. Default is: ${DEFAULT_ADMIN_KEY_HINT}`);
    }
  };

  const handleSaveProfileAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    updateProfile({
      phone: phone || user.phone,
      address: {
        ...user.address,
        addressLine1,
        city,
        province,
        postalCode,
        fullName: user.name,
        email: user.email,
        country: 'Pakistan',
      },
    });
    showToast('Profile Updated', 'Default shipping details saved.', 'success');
    setShowAuthModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-slate-800 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {isAuthenticated && user ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284c7] font-black text-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#0f3460]">{user.name}</h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-50 text-[#0284c7] border border-sky-100">
                  {user.role === 'admin' ? 'Store Owner / Admin' : 'Verified Customer'}
                </span>
              </div>
            </div>

            {/* Profile address settings */}
            <form onSubmit={handleSaveProfileAddress} className="space-y-3 mb-6">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Default Shipping Address (Pakistan)
              </h4>
              <input
                type="text"
                placeholder="Street Address, House #"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
                <input
                  type="text"
                  placeholder="Province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Save Shipping Defaults
              </button>
            </form>

            <button
              onClick={() => {
                logout();
                setShowAuthModal(false);
              }}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            {/* Header Tabs */}
            <div className="flex border-b border-slate-200 mb-6 text-xs font-bold">
              <button
                onClick={() => { setMode('customer_login'); setError(''); }}
                className={`flex-1 py-3 border-b-2 text-center transition-colors cursor-pointer ${
                  mode === 'customer_login'
                    ? 'border-[#0284c7] text-[#0284c7] bg-sky-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Customer Login
              </button>
              <button
                onClick={() => { setMode('customer_register'); setError(''); }}
                className={`flex-1 py-3 border-b-2 text-center transition-colors cursor-pointer ${
                  mode === 'customer_register'
                    ? 'border-[#0284c7] text-[#0284c7] bg-sky-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => { setMode('owner_login'); setError(''); }}
                className={`flex-1 py-3 border-b-2 text-center transition-colors cursor-pointer ${
                  mode === 'owner_login'
                    ? 'border-amber-500 text-amber-700 bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Store Owner
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs mb-4 font-medium">
                {error}
              </div>
            )}

            {/* TAB 1: CUSTOMER LOGIN */}
            {mode === 'customer_login' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleOneClick}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google / Gmail</span>
                </button>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 my-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span>or sign in with email</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <form onSubmit={handleCustomerLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Gmail / Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Customer Sign In</span>
                  </button>
                </form>

                <p className="text-[11px] text-center text-slate-500 mt-3">
                  Don&apos;t have an account?{' '}
                  <button onClick={() => setMode('customer_register')} className="text-[#0284c7] font-bold hover:underline cursor-pointer">
                    Sign Up here
                  </button>
                </p>
              </div>
            )}

            {/* TAB 2: CUSTOMER SIGN UP */}
            {mode === 'customer_register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Muhammad Ali"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gmail / Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#0284c7] focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Customer Account</span>
                </button>
              </form>
            )}

            {/* TAB 3: STORE OWNER LOGIN */}
            {mode === 'owner_login' && (
              <form onSubmit={handleOwnerLogin} className="space-y-4">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                  <span className="text-base">🔐</span>
                  <div>
                    <p className="font-bold">Store Owner Portal Authentication</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Enter the verified store owner password to unlock admin management and sales controls.
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Owner Passphrase: <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono font-bold">{DEFAULT_ADMIN_KEY_HINT}</code>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate as Store Owner</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
