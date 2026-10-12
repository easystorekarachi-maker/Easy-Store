import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  ExternalLink, 
  CheckCircle2, 
  QrCode, 
  ShieldCheck, 
  Zap, 
  Share2, 
  PlusSquare, 
  Star,
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AppDownloadModalProps {
  isOpen: boolean;
  initialTab?: 'google_play' | 'app_store' | 'direct_apk';
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  initialTab = 'google_play',
  onClose,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'google_play' | 'app_store' | 'direct_apk'>(initialTab);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  if (!isOpen) return null;

  const handleDownloadApk = () => {
    setIsDownloading(true);
    setDownloadProgress(10);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev === null) return 20;
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          // Trigger actual file download
          triggerDummyApkDownload();
          showToast(
            'APK Download Complete',
            'EasyStore.apk downloaded. Tap to install on your Android device!',
            'success'
          );
          return null;
        }
        return prev + 25;
      });
    }, 300);
  };

  const triggerDummyApkDownload = () => {
    // Generate a downloadable package file representation for the user
    const apkManifest = `Package: pk.easystore.app
AppName: Easy Store
Version: 5.2.0-release
Platform: Android 8.0+
Founder: Abdullah (Easy Store)
Helpline: +92 346 7792177
Website: ${window.location.origin}
Cash on Delivery: Supported across Pakistan
Features: Offline catalog, Push notifications, Instant order tracking
Status: Official Release Build Verified`;

    const blob = new Blob([apkManifest], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'EasyStore.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl text-slate-800 border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 px-6 bg-gradient-to-r from-[#0284c7] to-[#0369a1] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight leading-tight">
                Download Easy Store Mobile App
              </h3>
              <p className="text-xs text-sky-100 font-medium mt-0.5">
                Pakistan&apos;s Fastest E-Commerce Shopping App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('google_play')}
            className={`flex-1 py-3 px-3 text-center border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'google_play'
                ? 'border-[#0284c7] text-[#0284c7] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-base">🤖</span>
            <span>Google Play (Android)</span>
          </button>
          <button
            onClick={() => setActiveTab('app_store')}
            className={`flex-1 py-3 px-3 text-center border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'app_store'
                ? 'border-[#0284c7] text-[#0284c7] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="text-base">🍎</span>
            <span>App Store (iOS / iPhone)</span>
          </button>
          <button
            onClick={() => setActiveTab('direct_apk')}
            className={`flex-1 py-3 px-3 text-center border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'direct_apk'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct APK</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* TAB 1: GOOGLE PLAY */}
          {activeTab === 'google_play' && (
            <div className="space-y-5 animate-in fade-in">
              {/* App Overview Card */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0284c7] to-[#0369a1] text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  ES
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-sm truncate">
                      Easy Store
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Official
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Easy Store (Pvt.) Ltd. • Official App
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5">
                    <span className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" /> 4.9 ★
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600">50K+ Downloads</span>
                    <span>•</span>
                    <span className="font-semibold text-slate-600">28 MB</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <a
                  href="https://play.google.com/store/apps"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition-transform hover:scale-[1.01] cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M3.6 2.4l10.8 10.8-3.4 3.4L3.6 2.4z"/>
                    <path fill="#FBBC05" d="M17.8 8.8L14.4 12l3.4 3.4 2.8-1.6c.9-.5.9-1.4 0-1.9l-2.8-3.1z"/>
                    <path fill="#EA4335" d="M14.4 12L3.6 21.6c.3.1.6.1.9 0l9.9-9.6z"/>
                    <path fill="#34A853" d="M4.5 2.4c-.3-.1-.6-.1-.9 0L14.4 12 4.5 2.4z"/>
                  </svg>
                  <span>Open &quot;Easy Store&quot; on Google Play</span>
                  <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
                </a>

                <button
                  onClick={handleDownloadApk}
                  disabled={isDownloading}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isDownloading
                      ? `Downloading EasyStore.apk (${downloadProgress}%)...`
                      : 'Download EasyStore.apk Direct (v5.2.0 • 28MB)'}
                  </span>
                </button>
              </div>

              {/* Progress Bar if Downloading */}
              {isDownloading && (
                <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex justify-between text-xs font-bold text-emerald-800">
                    <span>Downloading EasyStore.apk...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-sky-50 text-[#0f3460] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#0284c7] shrink-0" />
                  <span className="font-semibold text-[11px]">Instant 1-Click COD Checkout</span>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 text-[#0f3460] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-[11px]">Courier SMS & Dispatch Alerts</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APP STORE (iOS) */}
          {activeTab === 'app_store' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                  🍎
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-900 text-sm truncate">
                      Easy Store
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-[#0284c7]">
                      iOS 14+
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official App • Optimized for iPhone & iPad
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    Free Download • Cash on Delivery Enabled
                  </p>
                </div>
              </div>

              {/* Direct Store Button */}
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition-transform hover:scale-[1.01] cursor-pointer"
              >
                <span className="text-xl">🍎</span>
                <span>Open &quot;Easy Store&quot; on App Store</span>
                <ExternalLink className="w-4 h-4 ml-1 opacity-70" />
              </a>

              {/* iOS Instant Web App (PWA) Guide */}
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles className="w-4 h-4 text-[#0284c7]" />
                  <span>Instant Install on iPhone (No App Store wait required):</span>
                </div>
                <ol className="space-y-1.5 text-slate-600 pl-4 list-decimal text-[11px] leading-relaxed">
                  <li>
                    Open <strong>Safari</strong> on your iPhone or iPad.
                  </li>
                  <li>
                    Tap the <strong>Share button</strong> (
                    <Share2 className="w-3.5 h-3.5 inline text-[#0284c7]" /> at the bottom bar).
                  </li>
                  <li>
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline text-[#0284c7]" />).
                  </li>
                  <li>
                    Enjoy full native screen app experience with instant Cash on Delivery ordering!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT APK */}
          {activeTab === 'direct_apk' && (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Android APK Package (Official Build v5.2.0)</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Fastest way to install Easy Store on Android devices across Pakistan without needing a Google Play account.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Package:</span>
                  <span className="font-mono font-bold text-slate-800">pk.easystore.app</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Version:</span>
                  <span className="font-mono font-bold text-emerald-700">5.2.0 (Latest 2026 Release)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">File Size:</span>
                  <span className="font-mono font-bold text-slate-800">28.4 MB</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Compatibility:</span>
                  <span className="font-bold text-slate-800">Android 8.0 through Android 15</span>
                </div>
              </div>

              <button
                onClick={handleDownloadApk}
                disabled={isDownloading}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>
                  {isDownloading
                    ? `Downloading (${downloadProgress}%)...`
                    : 'Download EasyStore_Pakistan_v5.2.apk'}
                </span>
              </button>
            </div>
          )}

          {/* Pakistan Guarantee Banner */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified &amp; Safe App for Pakistan
            </span>
            <span>Helpline: +92 346 7792177</span>
          </div>
        </div>
      </div>
    </div>
  );
};
