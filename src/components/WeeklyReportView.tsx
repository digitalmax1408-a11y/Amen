import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Star, 
  CheckCircle2, 
  Send, 
  Calendar, 
  TrendingUp, 
  Share2, 
  Printer, 
  Bell, 
  Sparkles, 
  User, 
  MessageSquare
} from 'lucide-react';
import { UserProfile, Task } from '../types';
import { sendNotification, sendMessage } from '../lib/familyStore';
import { triggerCelebration } from '../lib/celebration';

interface WeeklyReportViewProps {
  users: UserProfile[];
  tasks: Task[];
  currentUser: UserProfile;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  users,
  tasks,
  currentUser,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [customFatherNote, setCustomFatherNote] = useState('فخور بجهودكم وإنجازاتكم المشرفة يا أبطال، استمروا في هذا التميز والتفوق!');

  const familyMembers = users.filter((u) => u.role !== 'admin');

  // Filter tasks based on period
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const relevantTasks = tasks.filter((t) => {
    if (t.status !== 'approved') return false;
    const taskTime = new Date(t.updatedAt || t.createdAt).getTime();
    if (filterPeriod === 'week') return taskTime >= oneWeekAgo;
    if (filterPeriod === 'month') return taskTime >= oneMonthAgo;
    return true;
  });

  // Calculate statistics for each family member
  const memberStats = familyMembers.map((member) => {
    const memberApprovedTasks = relevantTasks.filter(
      (t) => t.assignedToUid === member.uid || (t.assigneeType === 'all' && t.status === 'approved')
    );
    const totalPointsEarned = memberApprovedTasks.reduce((sum, t) => sum + (t.points || 0), 0);
    const ratings = memberApprovedTasks
      .map((t) => t.evaluationRating)
      .filter((r): r is number => typeof r === 'number');
    const avgRating = ratings.length > 0 
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
      : '5.0';

    return {
      member,
      completedCount: memberApprovedTasks.length,
      pointsEarned: totalPointsEarned,
      avgRating,
      tasks: memberApprovedTasks,
    };
  });

  // Sort by points earned descending to find top performer
  const sortedStats = [...memberStats].sort((a, b) => b.pointsEarned - a.pointsEarned || b.completedCount - a.completedCount);
  const topPerformer = sortedStats[0];

  const totalCompletedTasks = memberStats.reduce((sum, s) => sum + s.completedCount, 0);
  const totalPointsAwarded = memberStats.reduce((sum, s) => sum + s.pointsEarned, 0);

  // Send Report as In-App Notification & Message
  const handleSendInAppReport = async () => {
    setIsSending(true);
    try {
      const topName = topPerformer && topPerformer.pointsEarned > 0 ? topPerformer.member.name : 'جميع الأبناء';
      const periodLabel = filterPeriod === 'week' ? 'لهذا الأسبوع' : filterPeriod === 'month' ? 'لهذا الشهر' : 'العام';
      
      const summaryLines = sortedStats
        .map((s) => `• ${s.member.name}: ${s.completedCount} مهام منجزة (+${s.pointsEarned} ⭐)`)
        .join(' | ');

      const notificationTitle = `📊 تقرير الإنجازات الأسبوعي من الوالد`;
      const notificationMsg = `أبطال التحدي، صدر تقرير الإنجازات ${periodLabel}! بطل الصدارة: ${topName} 👑. ${summaryLines}. كلمة الوالد: "${customFatherNote}"`;

      // 1. Send In-App Notification to all
      await sendNotification({
        userId: 'all',
        title: notificationTitle,
        message: notificationMsg,
        type: 'points',
        isRead: false,
        createdAt: new Date().toISOString(),
      });

      // 2. Send as official message to family inbox
      await sendMessage({
        senderId: currentUser.uid,
        senderName: currentUser.name,
        recipientType: 'all',
        title: `🏆 تقرير الإنجازات الأسبوعي الرسمي - كلمة الوالد`,
        content: `السلام عليكم ورحمة الله وبركاته يا أبطال،\n\nنبارك لكم إنجازات هذا الأسبوع المبارك:\n\n${sortedStats.map((s, idx) => `${idx + 1}. ${s.member.avatar} ${s.member.name}: أنجز ${s.completedCount} مهام وحصد ${s.pointsEarned} نقطة بالتقييم (⭐ ${s.avgRating} / 5).`).join('\n')}\n\n🌟 بطل الصدارة لهذا الأسبوع: ${topName} 👑\n\n📝 رسالة الوالد: ${customFatherNote}\n\nدمتم متميزين ورافعين للرأس دائماً! ✨`,
      });

      triggerCelebration(50);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 5000);
    } catch (err) {
      console.error('Error sending report:', err);
      alert('حدث خطأ أثناء إرسال التقرير. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  // WhatsApp Share
  const handleShareWhatsApp = () => {
    const topName = topPerformer && topPerformer.pointsEarned > 0 ? topPerformer.member.name : 'جميع الأبناء';
    const lines = sortedStats
      .map((s, idx) => `${idx === 0 ? '👑' : '⭐'} *${s.member.name}:* ${s.completedCount} مهام منجزة | +${s.pointsEarned} نقطة`)
      .join('\n');

    const text = `📊 *تقرير الإنجازات الأسبوعي - تحدّي العائلة* 🏆\n` +
      `📅 *الفترة:* الأسبوع الحالي\n` +
      `🌟 *بطل الصدارة والأداء المتميز:* ${topName} 👑\n\n` +
      `🎯 *ملخص نتائج الأبطال:*\n${lines}\n\n` +
      `📝 *رسالة الوالد (المدير):*\n"${customFatherNote}"\n\n` +
      `📲 *تفقّد تفاصيل إنجازاتك في التطبيق:*\n${window.location.origin}?app=kids\n\n` +
      `*بارك الله فيكم ونفع بكم يا قرة الأعين ✨*`;

    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 text-xs font-bold mb-1.5 border border-sky-200/60">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>لوحة التقييم والإنجاز الأسبوعي</span>
          </div>
          <h3 className="font-extrabold text-lg text-[#0F2847]">
            تقرير الإنجازات الأسبوعي للعائلة
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            ملخص المهام المنجزة والنقاط المكتسبة لكل ابن بعد التقييم مع إمكانية البث المباشر داخل التطبيق
          </p>
        </div>

        {/* Filter Period Buttons */}
        <div className="flex items-center gap-1 bg-sky-50/80 p-1 rounded-xl border border-sky-100 self-start sm:self-auto">
          <button
            onClick={() => setFilterPeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterPeriod === 'week' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-sky-900'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => setFilterPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterPeriod === 'month' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-sky-900'
            }`}
          >
            آخر شهر
          </button>
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterPeriod === 'all' ? 'bg-white text-sky-900 shadow-xs' : 'text-slate-600 hover:text-sky-900'
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* Top Banner: Champion of the Week */}
      {topPerformer && topPerformer.pointsEarned > 0 ? (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-3xl p-5 text-white shadow-lg shadow-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-right">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner shrink-0">
              {topPerformer.member.avatar}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/25 text-[11px] font-black text-amber-950 mb-1">
                <Trophy className="w-3.5 h-3.5 text-white fill-white" />
                <span>بطل الإنجاز الأسبوعي الأول 👑</span>
              </div>
              <h4 className="text-xl font-black text-white">
                البطل: {topPerformer.member.name}
              </h4>
              <p className="text-xs text-amber-50 font-medium mt-0.5">
                حقق أعلى مجموع نقاط هذا الأسبوع بإنجاز {topPerformer.completedCount} مهام معتمدة (+{topPerformer.pointsEarned} نقطة ⭐)
              </p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md rounded-2xl px-5 py-3 text-center border border-white/30 shrink-0">
            <span className="text-[11px] font-bold text-amber-100 block">إجمالي النقاط المكتسبة</span>
            <span className="text-2xl font-black text-white">+{topPerformer.pointsEarned}</span>
            <span className="text-xs text-amber-100 mr-1">نقطة ⭐</span>
          </div>
        </div>
      ) : (
        <div className="bg-sky-50/60 rounded-2xl p-4 text-center border border-sky-100 text-xs text-slate-500">
          لم يتم اعتماد أي مهام جديدة خلال هذه الفترة بعد. بمجرد تقييم واعتماد المهام المسلّمة، ستظهر إحصائيات بطل الأسبوع هنا فوراً.
        </div>
      )}

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#F8FBFE] p-4 rounded-2xl border border-sky-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
            <CheckCircle2 className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">المهام المنجزة المعتمدة</span>
            <span className="text-lg font-black text-[#0F2847]">{totalCompletedTasks} مهمة</span>
          </div>
        </div>

        <div className="bg-[#F8FBFE] p-4 rounded-2xl border border-sky-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">مجموع النقاط الممنوحة بالتقييم</span>
            <span className="text-lg font-black text-amber-600">+{totalPointsAwarded} ⭐</span>
          </div>
        </div>

        <div className="bg-[#F8FBFE] p-4 rounded-2xl border border-sky-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">الأبناء المتفاعلون</span>
            <span className="text-lg font-black text-emerald-700">
              {memberStats.filter(s => s.completedCount > 0).length} من {familyMembers.length} أبناء
            </span>
          </div>
        </div>
      </div>

      {/* Member Details Breakdown */}
      <div className="space-y-3">
        <h4 className="font-extrabold text-sm text-[#0F2847] flex items-center gap-2">
          <Award className="w-4 h-4 text-sky-600" />
          <span>تفاصيل إنجازات أفراد العائلة (أمية، أيمن، أنس):</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {memberStats.map(({ member, completedCount, pointsEarned, avgRating, tasks: mTasks }) => (
            <div 
              key={member.uid} 
              className={`p-4 rounded-2xl border transition-all ${
                topPerformer?.member.uid === member.uid && pointsEarned > 0
                  ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20'
                  : 'bg-[#FBFDFF] border-sky-100 hover:border-sky-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl">{member.avatar}</span>
                  <div>
                    <h5 className="font-bold text-sm text-[#0F2847]">{member.name}</h5>
                    <p className="text-[10px] text-slate-400">{member.levelTitle}</p>
                  </div>
                </div>

                {topPerformer?.member.uid === member.uid && pointsEarned > 0 && (
                  <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                    المتصدر 👑
                  </span>
                )}
              </div>

              {/* Stats Grid for Member */}
              <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-sky-100 text-center mb-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">المهام المنجزة</span>
                  <span className="text-base font-black text-[#0F2847]">{completedCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">النقاط المحققة</span>
                  <span className="text-base font-black text-amber-600">+{pointsEarned} ⭐</span>
                </div>
              </div>

              {/* Rating Summary */}
              <div className="flex items-center justify-between text-xs px-1 text-slate-600 mb-2">
                <span>متوسط تقييم الوالد:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>{avgRating} / 5</span>
                </span>
              </div>

              {/* Completed Tasks List Preview */}
              <div className="mt-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">
                  أحدث المهام المعتمدة ({mTasks.length}):
                </span>
                {mTasks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">لا توجد مهام معتمدة في هذه الفترة</p>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {mTasks.slice(0, 3).map((t) => (
                      <div key={t.id} className="text-[11px] bg-sky-50/70 p-1.5 rounded-lg flex items-center justify-between text-slate-700">
                        <span className="truncate max-w-[140px] font-medium">{t.title}</span>
                        <span className="text-[10px] font-bold text-amber-700 shrink-0">+{t.points} ⭐</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Father's Note Customization */}
      <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 space-y-2">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
          <span>كلمة وتوجيه الوالد المرفق مع التقرير:</span>
        </label>
        <input
          type="text"
          value={customFatherNote}
          onChange={(e) => setCustomFatherNote(e.target.value)}
          placeholder="اكتب كلمة تشجيع أو توجيه تظهر مع إشعار التقرير..."
          className="w-full p-2.5 rounded-xl border border-sky-200 text-xs bg-white text-slate-800"
        />
      </div>

      {/* Broadcast & Share Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
        <button
          onClick={handleSendInAppReport}
          disabled={isSending}
          className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all disabled:opacity-50"
        >
          <Bell className="w-4 h-4" />
          <span>
            {isSending ? 'جاري بث التقرير...' : 'إرسال التقرير كرسالة تنبيه داخل التطبيق 📢'}
          </span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>مشاركة عبر واتساب 💬</span>
        </button>

        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          title="طباعة التقرير"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة 🖨️</span>
        </button>
      </div>

      {/* Success Banner */}
      {sendSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>تم إرسال تقرير الإنجازات الأسبوعي بنجاح كرسالة تنبيه لجميع الأبناء داخل التطبيق! 🔔</span>
        </div>
      )}

    </div>
  );
};
