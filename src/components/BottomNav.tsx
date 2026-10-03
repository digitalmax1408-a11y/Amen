import React from 'react';
import { Home, CheckSquare, Gift, Flame, Trophy, ShieldCheck, Mail, Eye } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  unreadMessagesCount: number;
  appMode: 'admin' | 'user';
  onToggleAppMode: (mode: 'admin' | 'user') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  isAdmin,
  unreadMessagesCount,
  appMode,
  onToggleAppMode,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-sky-100 shadow-[0_-4px_20px_rgba(15,40,71,0.05)] md:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        
        {appMode === 'admin' ? (
          <>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'admin' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">المدير</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'tasks' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CheckSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">المهام</span>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'rewards' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Gift className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">الجوائز</span>
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'messages' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Mail className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">الرسائل</span>
            </button>

            <button
              onClick={() => onToggleAppMode('user')}
              className="flex flex-col items-center justify-center w-14 h-full transition-colors text-amber-600 hover:text-amber-700"
            >
              <Eye className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">الأبناء</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'home' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">الرئيسية</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'tasks' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CheckSquare className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">مهامي</span>
            </button>

            <button
              onClick={() => setActiveTab('rewards')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'rewards' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Gift className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">الجوائز</span>
            </button>

            <button
              onClick={() => setActiveTab('challenges')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'challenges' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Flame className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">التحديات</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex flex-col items-center justify-center w-14 h-full transition-colors ${
                activeTab === 'leaderboard' ? 'text-sky-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Trophy className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">الترتيب</span>
            </button>
          </>
        )}

      </div>
    </nav>
  );
};
