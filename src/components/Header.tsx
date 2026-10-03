import React, { useState } from 'react';
import { 
  Trophy, 
  Bell, 
  ShieldCheck, 
  UserCheck, 
  LogOut, 
  CheckCircle2, 
  Flame, 
  Star, 
  Menu, 
  X,
  Sparkles,
  Smartphone,
  Lock,
  Share2,
  Copy,
  Eye
} from 'lucide-react';
import { UserProfile, AppNotification } from '../types';
import { markNotificationRead } from '../lib/familyStore';
import { 
  getBrowserNotificationPermission, 
  requestBrowserNotificationPermission, 
  sendBrowserNotification 
} from '../lib/notifications';

interface HeaderProps {
  currentUser: UserProfile;
  notifications: AppNotification[];
  isAdmin: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  onSwitchUser: (user: UserProfile) => void;
  availableUsers: UserProfile[];
  appMode: 'admin' | 'user';
  onToggleAppMode: (mode: 'admin' | 'user') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  isAdmin,
  activeTab,
  setActiveTab,
  onOpenAuth,
  onSwitchUser,
  availableUsers,
  appMode,
  onToggleAppMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [browserPerm, setBrowserPerm] = useState<string>(getBrowserNotificationPermission());

  const handleRequestBrowserNotif = async () => {
    const granted = await requestBrowserNotificationPermission();
    setBrowserPerm(granted ? 'granted' : 'denied');
    if (granted) {
      sendBrowserNotification('تم تفعيل إشعارات المتصفح بنجاح! 🔔', {
        body: 'ستصلك تنبيهات المهام واعتماد النقاط حتى لو كان التطبيق في الخلفية.',
      });
    }
  };

  // User notifications: targeted to this user or 'all'
  const userNotifications = notifications.filter(
    (n) => n.userId === 'all' || n.userId === currentUser.uid
  );
  const unreadCount = userNotifications.filter((n) => !n.isRead).length;

  const handleCopyKidsLink = () => {
    const link = `${window.location.origin}?app=kids`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100/80 shadow-[0_2px_15px_-3px_rgba(15,40,71,0.04)]">
      
      {/* Top Banner showing Mode & Switcher */}
      <div className="bg-[#0B1E36] text-white text-[11px] py-1.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {appMode === 'admin' ? (
              <span className="font-bold flex items-center gap-1.5 text-amber-300">
                <span>👑 تطبيق المدير (الوالد)</span>
                <span className="bg-sky-900/80 text-sky-200 px-2 py-0.2 rounded-full text-[10px] font-normal border border-sky-700/50">
                  لوحة التحكم والسيطرة الكاملة
                </span>
              </span>
            ) : (
              <span className="font-bold flex items-center gap-1.5 text-sky-300">
                <span>🌟 تطبيق الأبناء (أمية، أيمن، أنس)</span>
                <span className="bg-sky-950 text-sky-200 px-2 py-0.2 rounded-full text-[10px] font-normal">
                  حساب البطل: {currentUser.name}
                </span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {appMode === 'admin' ? (
              <>
                <button
                  onClick={handleCopyKidsLink}
                  className="bg-sky-700/80 hover:bg-sky-600 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedLink ? 'تم نسخ رابط الأبناء ✓' : 'رابط تطبيق الأبناء'}</span>
                </button>
                <button
                  onClick={() => onToggleAppMode('user')}
                  className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <Eye className="w-3 h-3 text-sky-300" />
                  <span>معاينة تطبيق الأبناء 👁️</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onToggleAppMode('admin')}
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 px-2.5 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs"
              >
                <Lock className="w-3 h-3" />
                <span>العودة لتطبيق المدير (الوالد) 👑</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('home')}
            className="cursor-pointer flex items-center gap-3 group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform duration-200">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-[#0F2847] tracking-tight">
                  تحدّي العائلة
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  appMode === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-800'
                }`}>
                  {appMode === 'admin' ? 'لوحة المدير' : 'تطبيق الأبطال'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {appMode === 'admin' ? 'الإدارة والتحكم في المهام والنقاط' : 'مبادرة الأسرة للإنجاز والتفوق'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links based on App Mode */}
        {appMode === 'admin' ? (
          <nav className="hidden md:flex items-center gap-1 bg-sky-50/70 p-1.5 rounded-xl border border-sky-100/70">
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'admin' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-sky-100/70'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>لوحة المدير</span>
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tasks' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              المهام
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'rewards' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              متجر الجوائز
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'challenges' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              التحديات
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              لوحة الترتيب
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'messages' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              الرسائل
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-1 bg-sky-50/70 p-1.5 rounded-xl border border-sky-100/70">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'home' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              الرئيسية
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'tasks' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              مهامي الحالية
            </button>
            <button
              onClick={() => setActiveTab('rewards')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'rewards' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              متجر الجوائز
            </button>
            <button
              onClick={() => setActiveTab('challenges')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'challenges' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              التحديات
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'leaderboard' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              الترتيب
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'messages' ? 'bg-white text-sky-900 shadow-sm' : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              الرسائل
            </button>
          </nav>
        )}

        {/* Right Section: Stats, Notifications, Profile */}
        <div className="flex items-center gap-3">
          
          {/* User Points & Streak Pill (in user mode) */}
          {appMode === 'user' && (
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-sky-50 to-white px-3 py-1.5 rounded-xl border border-sky-100">
              <div className="flex items-center gap-1 text-sky-700 font-bold text-sm">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{currentUser.points}</span>
                <span className="text-[11px] text-slate-500 font-normal">نقطة</span>
              </div>
              <div className="w-px h-4 bg-sky-200 mx-1" />
              <div className="flex items-center gap-1 text-amber-600 font-semibold text-xs" title="سلسلة الإنجاز">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{currentUser.streak} أيام</span>
              </div>
            </div>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 rounded-xl text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-transparent hover:border-sky-100 transition-colors"
              title="الإشعارات"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-sky-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-bold text-[#0F2847] text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-600" />
                    الإشعارات والتنبيهات
                  </h4>
                  <span className="text-xs text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} غير مقروء
                  </span>
                </div>

                {/* Browser Notification Permission Banner */}
                <div className="px-4 py-2 bg-sky-50/70 border-b border-sky-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Bell className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="font-semibold text-[11px]">إشعارات المتصفح في الخلفية:</span>
                  </div>
                  {browserPerm === 'granted' ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      مفعّلة ✓
                    </span>
                  ) : (
                    <button
                      onClick={handleRequestBrowserNotif}
                      className="text-[10px] font-bold text-white bg-sky-600 hover:bg-sky-700 px-2 py-0.5 rounded-lg transition-colors shadow-xs"
                    >
                      تفعيل الإشعارات 🔔
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 px-2 py-1">
                  {userNotifications.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      لا توجد إشعارات جديدة حالياً
                    </div>
                  ) : (
                    userNotifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl transition-colors cursor-pointer text-right flex items-start gap-3 ${
                          n.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-sky-50/50 hover:bg-sky-50'
                        }`}
                      >
                        <div className="mt-0.5 w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                          {n.type === 'points' ? '⭐' : n.type === 'task' ? '📋' : '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-xs font-bold text-[#0F2847] truncate">
                              {n.title}
                            </p>
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 hover:border-sky-200 transition-all text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center text-base shadow-sm">
                {currentUser.avatar || '👤'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[#0F2847] leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentUser.role === 'admin' ? 'المدير (الوالد)' : currentUser.levelTitle}
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-sky-100 py-3 z-50">
                <div className="px-4 pb-3 border-b border-slate-100 text-right">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentUser.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-[#0F2847]">{currentUser.name}</h4>
                      <p className="text-xs text-sky-700 font-medium">
                        {currentUser.role === 'admin' ? 'المدير المسؤول' : `المستوى ${currentUser.level} • ${currentUser.levelTitle}`}
                      </p>
                    </div>
                  </div>
                  {currentUser.role !== 'admin' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>رصيد النقاط:</span>
                      <span className="font-bold text-sky-800">{currentUser.points} ⭐</span>
                    </div>
                  )}
                </div>

                {/* Profile List */}
                <div className="px-3 py-2 text-right">
                  <p className="text-[11px] font-bold text-slate-400 mb-1 px-1">
                    {appMode === 'admin' ? 'أفراد الأسرة المدارين:' : 'تبديل حساب البطل:'}
                  </p>
                  <div className="space-y-1">
                    {availableUsers.map((u) => (
                      <button
                        key={u.uid}
                        onClick={() => {
                          onSwitchUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-right px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          u.uid === currentUser.uid 
                            ? 'bg-sky-50 text-sky-900 font-bold border border-sky-200' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{u.avatar}</span>
                          <span>{u.name}</span>
                          {u.role === 'admin' && (
                            <span className="text-[10px] bg-sky-200/70 text-sky-900 px-1.5 py-0.2 rounded font-bold">
                              المدير
                            </span>
                          )}
                        </div>
                        {u.uid === currentUser.uid ? (
                          <CheckCircle2 className="w-4 h-4 text-sky-600" />
                        ) : (
                          <span className="text-[11px] text-slate-400">{u.points} ⭐</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-3 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-right px-3 py-2 rounded-xl text-xs text-slate-600 hover:text-sky-800 hover:bg-sky-50 flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-sky-600" />
                    تسجيل الدخول بحساب Google أو رمز المرور
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-sky-50"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white/95 px-4 py-3 space-y-2">
          {appMode === 'admin' ? (
            <>
              <button
                onClick={() => { setActiveTab('admin'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-bold bg-sky-600 text-white flex items-center justify-between"
              >
                <span>لوحة المدير</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setActiveTab('tasks'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                المهام
              </button>
              <button
                onClick={() => { onToggleAppMode('user'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-bold bg-sky-50 text-sky-800 flex items-center justify-between"
              >
                <span>معاينة تطبيق الأبناء</span>
                <Eye className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                الرئيسية
              </button>
              <button
                onClick={() => { setActiveTab('tasks'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                مهامي الحالية
              </button>
              <button
                onClick={() => { setActiveTab('rewards'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                متجر الجوائز
              </button>
              <button
                onClick={() => { setActiveTab('challenges'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                التحديات
              </button>
              <button
                onClick={() => { setActiveTab('leaderboard'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-semibold text-slate-700"
              >
                لوحة الترتيب
              </button>
              <button
                onClick={() => { onToggleAppMode('admin'); setMobileMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-sm font-bold bg-amber-50 text-amber-900 border border-amber-200"
              >
                العودة لتطبيق المدير (الوالد) 🔒
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

