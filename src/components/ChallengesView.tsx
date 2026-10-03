import React from 'react';
import { Flame, Star, Calendar, Target, CheckCircle2, Trophy, Sparkles } from 'lucide-react';
import { Challenge, UserProfile, Task } from '../types';

interface ChallengesViewProps {
  challenges: Challenge[];
  currentUser: UserProfile;
  tasks: Task[];
}

export const ChallengesView: React.FC<ChallengesViewProps> = ({
  challenges,
  currentUser,
  tasks,
}) => {
  // Count user approved tasks this week/month
  const userApprovedTasks = tasks.filter(
    (t) => (t.assignedToUid === currentUser.uid || t.assigneeType === 'all') && t.status === 'approved'
  ).length;

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-right">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-orange-600 via-sky-600 to-[#0F2847] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-orange-100 text-xs font-semibold mb-3 border border-white/20">
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>التنافس الشريف والإنجاز المستمر</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            🔥 التحديات العائلية الكبرى
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm max-w-lg leading-relaxed opacity-90">
            تحديات أسبوعية وشهرية مخصصة للأبطال. أنجز الأهداف المطلوبة واكسب مكافآت النقاط الكبرى دفعة واحدة!
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-44">
          <span className="text-xs text-sky-200 block mb-1">المهام المنجزة المعتمدة:</span>
          <div className="text-3xl font-black text-amber-300 flex items-center justify-center gap-1">
            <Trophy className="w-6 h-6 text-amber-300" />
            <span>{userApprovedTasks}</span>
          </div>
          <span className="text-[11px] text-sky-200 mt-1 block">مهمة مسجلة لك</span>
        </div>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {challenges.map((challenge) => {
          const progress = Math.min(challenge.targetCount, userApprovedTasks);
          const percentage = Math.round((progress / challenge.targetCount) * 100);
          const isCompleted = progress >= challenge.targetCount;

          return (
            <div
              key={challenge.id}
              className={`bg-white rounded-3xl p-6 border shadow-[0_4px_20px_-4px_rgba(15,40,71,0.06)] flex flex-col justify-between transition-all ${
                isCompleted ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-sky-100 hover:border-sky-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    challenge.type === 'weekly' 
                      ? 'bg-sky-100 text-sky-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {challenge.type === 'weekly' ? 'تحدي الأسبوع' : 'تحدي الشهر'}
                  </span>
                  
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-xs border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    <span>+{challenge.rewardPoints} نقطة مكافأة</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-lg text-[#0F2847] mb-2">
                  {challenge.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {challenge.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">التقدم المحرز:</span>
                    <span className={isCompleted ? 'text-emerald-700' : 'text-sky-700'}>
                      {progress} من {challenge.targetCount} مهام ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/80">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isCompleted 
                          ? 'bg-emerald-500' 
                          : 'bg-gradient-to-l from-sky-500 to-sky-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  <span>ينتهي في: {challenge.endDate}</span>
                </div>

                {isCompleted ? (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم إنجاز التحدي بنجاح!</span>
                  </span>
                ) : (
                  <span className="text-slate-500 font-medium">
                    متبقي {Math.max(0, challenge.targetCount - progress)} مهام
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
