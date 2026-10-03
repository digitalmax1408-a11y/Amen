import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Lock, 
  KeyRound, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { saveGoogleUserToFamily } from '../lib/familyStore';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUsers: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  currentUser: UserProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  availableUsers,
  onSelectUser,
  currentUser,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsLoadingGoogle(true);
      setErrorMessage('');
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        const profile = await saveGoogleUserToFamily({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
        });
        if (profile) {
          onSelectUser(profile);
          onClose();
        }
      }
    } catch (err: unknown) {
      console.error('Google Sign In error:', err);
      setErrorMessage('تعذر تسجيل الدخول بحساب Google. يمكنك اختيار ملفك الشخصي أدناه مباشرة.');
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleConfirmProfile = (user: UserProfile) => {
    // If Admin, require Admin PIN (default: '1234' or '0000') to protect the Father's admin panel
    if (user.role === 'admin') {
      setSelectedProfile(user);
      setPinInput('');
      setErrorMessage('');
    } else {
      onSelectUser(user);
      onClose();
    }
  };

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '1234' || pinInput === '0000' || pinInput === selectedProfile?.pin) {
      if (selectedProfile) {
        onSelectUser(selectedProfile);
        onClose();
      }
    } else {
      setErrorMessage('رمز الحماية غير صحيح. الرمز الافتراضي للوالد هو: 1234');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-md w-full p-6 text-right relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="text-center pb-4 border-b border-sky-50">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/25 mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-black text-[#0F2847]">
            تسجيل الدخول إلى تحدّي العائلة
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            اختر ملفك الشخصي أو سجّل الدخول بحساب Google
          </p>
        </div>

        {errorMessage && (
          <div className="my-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Admin PIN Verification View */}
        {selectedProfile?.role === 'admin' ? (
          <form onSubmit={handleVerifyAdminPin} className="py-4 space-y-4">
            <div className="text-center p-3 rounded-2xl bg-sky-50/70 border border-sky-100">
              <ShieldCheck className="w-8 h-8 text-sky-600 mx-auto mb-1" />
              <p className="text-sm font-bold text-[#0F2847]">
                تأكيد دخول الوالد (المدير)
              </p>
              <p className="text-xs text-slate-500">
                يرجى إدخال رمز المرور السري للوصول للوحة التحكم
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">
                رمز الحماية (PIN)
              </label>
              <div className="relative">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="أدخل الرمز (الافتراضي: 1234)"
                  className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-4 rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  autoFocus
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute top-3.5 right-3" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                الرمز الافتراضي للتجربة هو: <span className="font-mono font-bold text-sky-700">1234</span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all"
              >
                تأكيد الدخول
              </button>
              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                رجوع
              </button>
            </div>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            {/* Google Login Option */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoadingGoogle}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoadingGoogle ? 'جارِ التحقق...' : 'المتابعة باستخدام Google / Gmail'}</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-bold text-slate-400 absolute">
                أو اختر حسابك من أفراد الأسرة
              </span>
            </div>

            {/* Family Members Grid */}
            <div className="space-y-2">
              {availableUsers.map((u) => {
                const isCurrent = u.uid === currentUser.uid;
                const isAdmin = u.role === 'admin';
                return (
                  <button
                    key={u.uid}
                    onClick={() => handleConfirmProfile(u)}
                    className={`w-full text-right p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'border-sky-500 bg-sky-50/70 shadow-sm'
                        : 'border-slate-100 hover:border-sky-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-sky-100 flex items-center justify-center text-xl shadow-xs">
                        {u.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#0F2847]">{u.name}</span>
                          {isAdmin ? (
                            <span className="text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              المدير (الوالد)
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-medium">
                              المستوى {u.level}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {isAdmin ? 'تحكم كامل بالمهام والنقاط' : `${u.points} نقطة ⭐ • ${u.levelTitle}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-left text-xs font-semibold text-sky-700">
                      {isCurrent ? 'الحساب الحالي' : 'دخول'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
