import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_ADMIN_KEY_HINT } from '../services/db';
import { OwnerAvatar } from './OwnerAvatar';

interface AdminGateModalProps {
  onUnlockSuccess: () => void;
}

export const AdminGateModal: React.FC<AdminGateModalProps> = ({ onUnlockSuccess }) => {
  const { 
    showAdminGateModal, 
    setShowAdminGateModal, 
    unlockAdminGate, 
    adminLockRemainingSeconds 
  } = useAuth();
  
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showAdminGateModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim()) {
      setErrorMessage('Please enter the administrator passphrase.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      const res = unlockAdminGate(passphrase);
      setIsSubmitting(false);
      if (res.success) {
        setPassphrase('');
        setShowAdminGateModal(false);
        onUnlockSuccess();
      } else {
        setErrorMessage(res.error || 'Access denied.');
      }
    }, 300);
  };

  const isLockedOut = adminLockRemainingSeconds > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-slate-800 p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setShowAdminGateModal(false)}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Security Icon & Founder Portrait */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <OwnerAvatar size="xl" className="ring-4 ring-[#0284c7] shadow-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>
          <h2 className="text-xl font-black text-[#0f3460] tracking-tight">
            Security Admin Gateway
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-0.5">
            Store Founder: <strong className="text-slate-800">Abdullah</strong>
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Enter the verified master administrative passphrase to unlock store management, orders, and products.
          </p>
        </div>

        {/* Lockout Banner */}
        {isLockedOut ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-rose-600 shrink-0 animate-spin" />
            <div>
              <p className="font-bold">Security Lockout Active</p>
              <p className="text-[11px] text-rose-600 mt-0.5">
                Gateway suspended due to repeated invalid attempts. Retry in {adminLockRemainingSeconds}s.
              </p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 mb-5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{errorMessage}</p>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Master Admin Passphrase
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setErrorMessage('');
                }}
                disabled={isLockedOut || isSubmitting}
                placeholder="Enter passphrase..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/20 focus:bg-white rounded-xl py-3 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all disabled:opacity-50"
              />
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLockedOut || isSubmitting || !passphrase.trim()}
            className="w-full py-3.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>Verify & Access Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Credential Reference */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 bg-sky-50/70 rounded-xl border border-sky-100 text-xs">
            <div className="flex items-center gap-1.5 text-[#0284c7] font-bold mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>Initial Admin Passcode</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Default credential: <code className="bg-white border border-sky-200 px-1.5 py-0.5 rounded text-[#0284c7] font-bold font-mono select-all">{DEFAULT_ADMIN_KEY_HINT}</code>
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              You can change this passphrase or export store data anytime in the Admin Settings tab.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
