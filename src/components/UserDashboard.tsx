import React, { useState } from 'react';
import { 
  Star, 
  Flame, 
  Award, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronLeft, 
  Sparkles, 
  Filter, 
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { UserProfile, Task, Challenge } from '../types';
import { TaskDetailModal } from './TaskDetailModal';

interface UserDashboardProps {
  currentUser: UserProfile;
  tasks: Task[];
  challenges: Challenge[];
  onNavigateTab: (tab: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  tasks,
  challenges,
  onNavigateTab,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter tasks belonging to current user or assigned to 'all'
  const myTasks = tasks.filter(
    (t) => t.assigneeType === 'all' || t.assignedToUid === currentUser.uid
  );

  const filteredTasks = myTasks.filter((t) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'in_progress') return t.status === 'in_progress';
    if (filterStatus === 'submitted') return t.status === 'submitted';
    if (filterStatus === 'approved') return t.status === 'approved';
    return true;
  });

  const completedCount = myTasks.filter((t) => t.status === 'approved').length;
  const pendingApprovalCount = myTasks.filter((t) => t.status === 'submitted').length;
  const inProgressCount = myTasks.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-right">
      
      {/* Welcome Banner & Identity Hero */}
      <div className="bg-gradient-to-l from-sky-700 via-sky-600 to-[#0F2847] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>تحدّي العائلة • التميز اليومي</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              👋 أهلاً بك، {currentUser.name}
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm max-w-lg leading-relaxed opacity-90">
              همتك تصنع الفارق! استمر في تحقيق أهدافك اليومية واكسب النقاط للارتقاء في المستويات واستبدال أروع الجوائز.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('rewards')}
              className="py-2.5 px-4 rounded-xl bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
            >
              <span>متجر الجوائز</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('leaderboard')}
              className="py-2.5 px-4 rounded-xl bg-sky-800/60 hover:bg-sky-800 text-white font-semibold text-xs sm:text-sm border border-sky-400/30 transition-all"
            >
              لوحة الترتيب
            </button>
          </div>
        </div>
      </div>

      {/* Core Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Points Balance */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(15,40,71,0.05)] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">⭐ رصيد النقاط</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F2847]">
            {currentUser.points}
            <span className="text-xs font-medium text-slate-400 mr-1.5">نقطة</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            جاهزة للاستبدال بالمتجر
          </p>
        </div>

        {/* Level */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(15,40,71,0.05)] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">🏅 المستوى</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F2847]">
            المستوى {currentUser.level}
          </div>
          <p className="text-[11px] text-sky-700 font-semibold mt-1 truncate">
            {currentUser.levelTitle}
          </p>
        </div>

        {/* Streak */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(15,40,71,0.05)] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">🔥 سلسلة الإنجاز</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F2847]">
            {currentUser.streak}
            <span className="text-xs font-medium text-slate-400 mr-1.5">أيام</span>
          </div>
          <p className="text-[11px] text-orange-600 font-semibold mt-1">
            استمر يومياً ولا تتوقف!
          </p>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(15,40,71,0.05)] hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">🎯 المهام المنجزة</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F2847]">
            {completedCount}
            <span className="text-xs font-medium text-slate-400 mr-1.5">مهمة</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            {pendingApprovalCount > 0 ? `${pendingApprovalCount} بانتظار الاعتماد` : 'تم اعتماد جميع إنجازاتك'}
          </p>
        </div>

      </div>

      {/* Featured Weekly Challenge Banner (if any) */}
      {challenges.length > 0 && challenges[0] && (
        <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 rounded-2xl border border-sky-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                  {challenges[0].type === 'weekly' ? 'تحدي الأسبوع' : 'تحدي الشهر'}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  المكافأة: +{challenges[0].rewardPoints} ⭐
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#0F2847] mt-1">
                {challenges[0].title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {challenges[0].description}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('challenges')}
            className="w-full sm:w-auto py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
          >
            عرض التفاصيل
          </button>
        </div>
      )}

      {/* Section: مهامي الحالية */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F2847] flex items-center gap-2">
              <span>مهامي الحالية</span>
              <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                {myTasks.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              قائمة المهام الموكلة إليك من الوالد لمتابعتها وإنجازها
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === 'all'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/70'
              }`}
            >
              الكل ({myTasks.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === 'pending'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/70'
              }`}
            >
              جديدة
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === 'in_progress'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/70'
              }`}
            >
              قيد التنفيذ ({inProgressCount})
            </button>
            <button
              onClick={() => setFilterStatus('submitted')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === 'submitted'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/70'
              }`}
            >
              بانتظار الاعتماد ({pendingApprovalCount})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === 'approved'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/70'
              }`}
            >
              المكتملة ({completedCount})
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-sky-200 text-slate-400">
            <Compass className="w-12 h-12 text-sky-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-[#0F2847] mb-1">
              لا توجد مهام تطابق هذا التصنيف
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              تصفح التبويبات الأخرى أو ترقب مهاماً جديدة يضيفها المدير قريباً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => {
              const isApproved = task.status === 'approved';
              const isSubmitted = task.status === 'submitted';
              const isInProgress = task.status === 'in_progress';
              const isPending = task.status === 'pending';

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-5 border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(15,40,71,0.06)] hover:shadow-lg hover:border-sky-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/70 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>+{task.points} ⭐</span>
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {task.assigneeType === 'all' ? 'للجميع' : 'خاصة بك'}
                        </span>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {isPending && (
                          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                            جديدة
                          </span>
                        )}
                        {isInProgress && (
                          <span className="text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md animate-pulse">
                            جارية الآن ⏳
                          </span>
                        )}
                        {isSubmitted && (
                          <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                            بانتظار الاعتماد
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                            معتمدة ✓
                          </span>
                        )}
                        {task.status === 'rejected' && (
                          <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md">
                            تحتاج تعديل
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Task Title */}
                    <h3 className="font-bold text-base text-[#0F2847] leading-snug mb-2">
                      {task.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {task.description}
                    </p>
                  </div>

                  {/* Card Footer: Due Date & View Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      <span>موعد التسليم: <strong>{task.dueDate}</strong></span>
                    </div>

                    <button
                      onClick={() => setSelectedTask(task)}
                      className="py-1.5 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-600 hover:text-white text-sky-800 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <span>عرض المهمة</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          currentUser={currentUser}
        />
      )}

    </div>
  );
};
