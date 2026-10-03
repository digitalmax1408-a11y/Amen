import React from 'react';
import { Trophy, Star, Award, Flame, CheckCircle2, Crown, Sparkles } from 'lucide-react';
import { UserProfile, Task } from '../types';

interface LeaderboardViewProps {
  users: UserProfile[];
  tasks: Task[];
  currentUser: UserProfile;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  users,
  tasks,
  currentUser,
}) => {
  // Filter only members (excluding admin) and sort descending by points
  const rankedMembers = [...users]
    .filter((u) => u.role !== 'admin')
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-white flex items-center justify-center font-black text-sm shadow-md shadow-amber-400/30">
            🥇 1
          </div>
        );
      case 1:
        return (
          <div className="w-9 h-9 rounded-2xl bg-slate-300 text-slate-800 flex items-center justify-center font-black text-sm shadow-sm">
            🥈 2
          </div>
        );
      case 2:
        return (
          <div className="w-9 h-9 rounded-2xl bg-amber-700/80 text-white flex items-center justify-center font-black text-sm shadow-sm">
            🥉 3
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-right">
      
      {/* Banner */}
      <div className="bg-gradient-to-l from-amber-600 via-sky-700 to-[#0F2847] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-semibold mb-3 border border-white/20">
            <Crown className="w-3.5 h-3.5" />
            <span>لوحة الشرف العائلية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            🏆 لوحة الترتيب والأوسمة
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm max-w-lg leading-relaxed opacity-90">
            ترتيب أفراد الأسرة بناءً على رصيد النقاط المحققة والالتزام اليومي بالمهام والتحديات.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-44">
          <span className="text-xs text-amber-200 block mb-1">المتصدر الحالي:</span>
          <div className="text-xl font-black text-white flex items-center justify-center gap-1.5">
            <span>{rankedMembers[0]?.name || '-'}</span>
            <span className="text-xl">👑</span>
          </div>
          <span className="text-[11px] text-sky-200 mt-1 block font-bold">
            {rankedMembers[0]?.points || 0} نقطة ⭐
          </span>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {rankedMembers.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 max-w-2xl mx-auto items-end text-center">
          
          {/* Rank 2 (Silver) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-slate-200 flex items-center justify-center text-3xl">
                {rankedMembers[1]?.avatar}
              </div>
              <span className="absolute -bottom-2 -right-2 text-xl">🥈</span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-[#0F2847] mt-1">
              {rankedMembers[1]?.name}
            </h4>
            <span className="text-xs font-bold text-slate-500 mt-0.5">
              {rankedMembers[1]?.points} ⭐
            </span>
            <span className="text-[10px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full mt-2 font-medium">
              المركز الثاني
            </span>
          </div>

          {/* Rank 1 (Gold - Taller) */}
          <div className="bg-gradient-to-b from-amber-50/70 to-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-md flex flex-col items-center -translate-y-3">
            <div className="relative mb-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-center text-4xl shadow-sm">
                {rankedMembers[0]?.avatar}
              </div>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl animate-bounce">
                👑
              </span>
              <span className="absolute -bottom-2 -right-2 text-xl">🥇</span>
            </div>
            <h4 className="font-black text-base sm:text-lg text-[#0F2847] mt-1">
              {rankedMembers[0]?.name}
            </h4>
            <span className="text-sm font-extrabold text-amber-600 mt-0.5">
              {rankedMembers[0]?.points} ⭐
            </span>
            <span className="text-[11px] text-amber-800 bg-amber-100 font-bold px-2.5 py-0.5 rounded-full mt-2">
              بطل الصدارة 🌟
            </span>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border border-sky-100 shadow-sm flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-sky-50 border border-slate-200 flex items-center justify-center text-3xl">
                {rankedMembers[2]?.avatar}
              </div>
              <span className="absolute -bottom-2 -right-2 text-xl">🥉</span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-[#0F2847] mt-1">
              {rankedMembers[2]?.name}
            </h4>
            <span className="text-xs font-bold text-slate-500 mt-0.5">
              {rankedMembers[2]?.points} ⭐
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full mt-2 font-medium">
              المركز الثالث
            </span>
          </div>

        </div>
      )}

      {/* Detailed Ranking List */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-[0_4px_25px_-5px_rgba(15,40,71,0.06)]">
        <h3 className="font-extrabold text-base text-[#0F2847] mb-4 pb-3 border-b border-slate-100">
          جدول الترتيب الشامل
        </h3>

        <div className="space-y-3">
          {rankedMembers.map((member, index) => {
            const isMe = member.uid === currentUser.uid;
            const completedCount = tasks.filter(
              (t) => (t.assignedToUid === member.uid || t.assigneeType === 'all') && t.status === 'approved'
            ).length;

            return (
              <div
                key={member.uid}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isMe
                    ? 'border-sky-400 bg-sky-50/60 shadow-sm ring-1 ring-sky-300'
                    : 'border-slate-100 hover:border-sky-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(index)}
                  
                  <div className="w-12 h-12 rounded-xl bg-white border border-sky-100 flex items-center justify-center text-2xl shadow-xs">
                    {member.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm sm:text-base text-[#0F2847]">
                        {member.name}
                      </h4>
                      {isMe && (
                        <span className="text-[10px] font-bold bg-sky-600 text-white px-2 py-0.2 rounded-full">
                          أنت
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      المستوى {member.level} • {member.levelTitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-left">
                  <div className="hidden sm:block text-right">
                    <span className="text-[11px] text-slate-400 block">المهام المنجزة:</span>
                    <strong className="text-xs text-slate-700">{completedCount} مهمة</strong>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">المجموع:</span>
                    <strong className="text-base sm:text-lg font-black text-amber-600">
                      {member.points} ⭐
                    </strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
