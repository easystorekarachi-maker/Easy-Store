import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminUnlocked: boolean;
  adminLockRemainingSeconds: number;
  login: (email: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  unlockAdminGate: (passphrase: string) => { success: boolean; error?: string };
  lockAdminGate: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (open: boolean) => void;
  authModalTab: 'customer_login' | 'customer_register' | 'owner_login';
  openAuthModal: (tab?: 'customer_login' | 'customer_register' | 'owner_login') => void;
  showAdminGateModal: boolean;
  setShowAdminGateModal: (open: boolean) => void;
}

const SESSION_KEYS = {
  CURRENT_USER_EMAIL: 'easystore_session_user_email_v5',
  ADMIN_SESSION_TOKEN: 'easystore_session_admin_auth_v5',
  FAILED_ADMIN_ATTEMPTS: 'easystore_admin_failed_attempts_v5',
  LOCKOUT_UNTIL: 'easystore_admin_lockout_until_v5',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(false);
  const [adminLockRemainingSeconds, setAdminLockRemainingSeconds] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'customer_login' | 'customer_register' | 'owner_login'>('customer_login');
  const [showAdminGateModal, setShowAdminGateModal] = useState<boolean>(false);

  const openAuthModal = (tab: 'customer_login' | 'customer_register' | 'owner_login' = 'customer_login') => {
    setAuthModalTab(tab);
    setShowAuthModal(true);
  };

  // Restore session
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem(SESSION_KEYS.CURRENT_USER_EMAIL);
      if (savedEmail) {
        const found = db.getUserByEmail(savedEmail);
        if (found) {
          setUser(found);
          if (found.role === 'admin') {
            setIsAdminUnlocked(true);
          }
        }
      }
      // Check admin session token
      const adminToken = sessionStorage.getItem(SESSION_KEYS.ADMIN_SESSION_TOKEN);
      if (adminToken === 'valid_admin_session') {
        setIsAdminUnlocked(true);
      }
    } catch (e) {
      console.error('Error restoring auth state', e);
    }
  }, []);

  // Lockout timer ticker
  useEffect(() => {
    const checkLockout = () => {
      const lockoutUntil = Number(localStorage.getItem(SESSION_KEYS.LOCKOUT_UNTIL) || '0');
      const now = Date.now();
      if (lockoutUntil > now) {
        setAdminLockRemainingSeconds(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setAdminLockRemainingSeconds(0);
      }
    };
    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    let existing = db.getUserByEmail(cleanEmail);
    if (!existing) {
      // Auto-register customer if they are signing in for first time
      const defaultName = cleanEmail.split('@')[0];
      existing = db.saveUser({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: cleanEmail,
        role: cleanEmail.includes('admin') || cleanEmail.includes('easystorekarachi') ? 'admin' : 'customer',
      });
    }
    setUser(existing);
    localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, existing.email);
    if (existing.role === 'admin') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem(SESSION_KEYS.ADMIN_SESSION_TOKEN, 'valid_admin_session');
    }
    return { success: true };
  };

  const register = async (name: string, email: string, phone?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      return { success: false, error: 'Name is required.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }
    const newUser = db.saveUser({
      name: name.trim(),
      email: cleanEmail,
      phone: phone?.trim(),
      role: 'customer',
    });
    setUser(newUser);
    localStorage.setItem(SESSION_KEYS.CURRENT_USER_EMAIL, newUser.email);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAdminUnlocked(false);
    localStorage.removeItem(SESSION_KEYS.CURRENT_USER_EMAIL);
    sessionStorage.removeItem(SESSION_KEYS.ADMIN_SESSION_TOKEN);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = db.saveUser({
      ...user,
      ...data,
      name: data.name || user.name,
      email: user.email,
    });
    setUser(updated);
  };

  const unlockAdminGate = (passphrase: string): { success: boolean; error?: string } => {
    // Check lockout
    const lockoutUntil = Number(localStorage.getItem(SESSION_KEYS.LOCKOUT_UNTIL) || '0');
    if (lockoutUntil > Date.now()) {
      const wait = Math.ceil((lockoutUntil - Date.now()) / 1000);
      return {
        success: false,
        error: `Too many failed attempts. Security gateway locked. Please wait ${wait} seconds.`,
      };
    }

    const isValid = db.verifyAdminPassphrase(passphrase);
    if (isValid) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem(SESSION_KEYS.ADMIN_SESSION_TOKEN, 'valid_admin_session');
      localStorage.removeItem(SESSION_KEYS.FAILED_ADMIN_ATTEMPTS);
      setShowAdminGateModal(false);
      return { success: true };
    } else {
      const currentFails = Number(localStorage.getItem(SESSION_KEYS.FAILED_ADMIN_ATTEMPTS) || '0') + 1;
      localStorage.setItem(SESSION_KEYS.FAILED_ADMIN_ATTEMPTS, currentFails.toString());
      if (currentFails >= 5) {
        const lockoutPeriodMs = 60 * 1000;
        localStorage.setItem(SESSION_KEYS.LOCKOUT_UNTIL, (Date.now() + lockoutPeriodMs).toString());
        return {
          success: false,
          error: 'Security threshold exceeded. Admin access locked for 60 seconds.',
        };
      }
      return {
        success: false,
        error: `Invalid admin passphrase. ${5 - currentFails} attempt(s) remaining before security lockout.`,
      };
    }
  };

  const lockAdminGate = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem(SESSION_KEYS.ADMIN_SESSION_TOKEN);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'admin' || isAdminUnlocked,
        isAdminUnlocked,
        adminLockRemainingSeconds,
        login,
        register,
        logout,
        updateProfile,
        unlockAdminGate,
        lockAdminGate,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        openAuthModal,
        showAdminGateModal,
        setShowAdminGateModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
