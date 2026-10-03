import React, { useState } from 'react';
import { 
  Users, 
  CheckSquare, 
  Award, 
  Send, 
  Bell, 
  BarChart3, 
  Settings, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  FileText, 
  Flame, 
  Star, 
  ShieldCheck, 
  Clock, 
  Search, 
  Sparkles,
  DollarSign,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Lock,
  Unlock,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { 
  UserProfile, 
  Task, 
  Reward, 
  RewardClaim, 
  Challenge, 
  Message, 
  AppNotification, 
  AuditLog 
} from '../types';
import { 
  createTask, 
  deleteTask, 
  approveTask, 
  rejectTask, 
  adjustUserPoints, 
  createReward, 
  deleteReward, 
  deliverClaim, 
  createChallenge, 
  sendMessage, 
  addNewMember,
  toggleUserPermission,
  updateUserAccessCode,
  resetAllMembersPointsToZero
} from '../lib/familyStore';
import { triggerCelebration } from '../lib/celebration';
import { WhatsAppShareModal } from './WhatsAppShareModal';
import { TaskEvaluationModal } from './TaskEvaluationModal';
import { WeeklyReportView } from './WeeklyReportView';

interface AdminDashboardProps {
  currentUser: UserProfile;
  users: UserProfile[];
  tasks: Task[];
  rewards: Reward[];
  claims: RewardClaim[];
  challenges: Challenge[];
  messages: Message[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  tasks,
  rewards,
  claims,
  challenges,
  messages,
  notifications,
  auditLogs,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'users' | 'tasks' | 'approvals' | 'points' | 'rewards' | 'challenges' | 'messages' | 'reports' | 'logs'>('overview');

  // New Task Form State
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  // All task points start at 0 until Father sets the evaluation!
  const [taskPoints, setTaskPoints] = useState(0);
  const [taskDifficulty, setTaskDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [taskAssigneeType, setTaskAssigneeType] = useState<'all' | 'specific'>('all');
  const [taskAssignedUid, setTaskAssignedUid] = useState(users[1]?.uid || '');
  const [taskDueDate, setTaskDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [taskProofType, setTaskProofType] = useState<'photo' | 'video' | 'text' | 'any'>('text');

  // Points Adjustment State
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(users[1]?.uid || '');
  const [pointsDelta, setPointsDelta] = useState<number>(25);
  const [pointsReason, setPointsReason] = useState('');

  // Rejection Modal State
  const [taskToReject, setTaskToReject] = useState<Task | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Task Evaluation Modal State (Father sets evaluation score & rating)
  const [taskToEvaluate, setTaskToEvaluate] = useState<Task | null>(null);

  // New Reward Form
  const [showNewRewardModal, setShowNewRewardModal] = useState(false);
  const [rewardTitle, setRewardTitle] = useState('');
  const [rewardDesc, setRewardDesc] = useState('');
  const [rewardPoints, setRewardPoints] = useState(150);
  const [rewardCategory, setRewardCategory] = useState('امتيازات خاصة');

  // New Challenge Form
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDesc, setChallengeDesc] = useState('');
  const [challengeTarget, setChallengeTarget] = useState(5);
  const [challengeReward, setChallengeReward] = useState(200);
  const [challengeType, setChallengeType] = useState<'weekly' | 'monthly'>('weekly');

  // New Message Form
  const [msgRecipientType, setMsgRecipientType] = useState<'all' | 'user'>('all');
  const [msgRecipientUid, setMsgRecipientUid] = useState(users[1]?.uid || '');
  const [msgTitle, setMsgTitle] = useState('');
  const [msgContent, setMsgContent] = useState('');

  // New Member Form
  const [showNewMemberModal, setShowNewMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberAvatar, setMemberAvatar] = useState('🧒');
  const [memberAccessCode, setMemberAccessCode] = useState('');

  // Copy feedback state
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // WhatsApp share task state
  const [taskToShareWhatsApp, setTaskToShareWhatsApp] = useState<Task | null>(null);

  // Stats Calculations
  const submittedTasks = tasks.filter((t) => t.status === 'submitted');
  const totalApproved = tasks.filter((t) => t.status === 'approved').length;
  const familyMembersOnly = users.filter((u) => u.role !== 'admin');
  const totalFamilyPoints = familyMembersOnly.reduce((acc, u) => acc + (u.points || 0), 0);

  // App base URL for sharing
  const appBaseUrl = window.location.origin;

  const handleCopyLink = (member: UserProfile) => {
    const inviteLink = `${appBaseUrl}?user=${member.uid}`;
    navigator.clipboard.writeText(inviteLink);
    setCopiedUid(member.uid);
    setTimeout(() => setCopiedUid(null), 3000);
  };

  const handleShareWhatsApp = (member: UserProfile) => {
    const inviteLink = `${appBaseUrl}?user=${member.uid}`;
    const text = encodeURIComponent(
      `السلام عليكم يا ${member.name} 🌟\nهذا رابطك الخاص للانضمام إلى تطبيق «تحدّي العائلة» 🏆:\n${inviteLink}\nتم تفعيل الإذن والسماح لك من الوالد. انطلق واكسب النقاط واستبدل الجوائز الرائعة!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const targetUser = users.find((u) => u.uid === taskAssignedUid);
    const createdId = await createTask({
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      points: Number(taskPoints),
      difficulty: taskDifficulty,
      assigneeType: taskAssigneeType,
      assignedToUid: taskAssigneeType === 'specific' ? taskAssignedUid : undefined,
      assignedToName: taskAssigneeType === 'specific' ? targetUser?.name : undefined,
      dueDate: taskDueDate,
      proofType: taskProofType,
      createdBy: currentUser.uid,
    });

    const newTaskObj: Task = {
      id: createdId || `task_${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      points: Number(taskPoints),
      difficulty: taskDifficulty,
      assigneeType: taskAssigneeType,
      assignedToUid: taskAssigneeType === 'specific' ? taskAssignedUid : undefined,
      assignedToName: taskAssigneeType === 'specific' ? targetUser?.name : undefined,
      dueDate: taskDueDate,
      proofType: taskProofType,
      status: 'pending',
      createdBy: currentUser.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setShowNewTaskModal(false);
    setTaskTitle('');
    setTaskDesc('');

    // Open WhatsApp share modal directly!
    setTaskToShareWhatsApp(newTaskObj);
  };

  // Open evaluation modal for Father to set points & star rating
  const handleApproveTask = (task: Task) => {
    setTaskToEvaluate(task);
  };

  const handleConfirmEvaluation = async (
    task: Task, 
    evalData: { awardedPoints: number; rating: number; feedback: string }
  ) => {
    await approveTask(task, currentUser, evalData);
    if (evalData.awardedPoints > 0) {
      triggerCelebration(evalData.awardedPoints);
    }
    setTaskToEvaluate(null);
  };

  const handleResetAllMembersPoints = async () => {
    const ok = window.confirm(
      'تنبيه: هل أنت متأكد من تصفير نقاط جميع الأبناء (أمية، أيمن، أنس) إلى 0؟ ستكون جميع النقاط صفراً حتى تقوم أنت بوضع التقييم لكل مهمة منجزة.'
    );
    if (!ok) return;
    await resetAllMembersPointsToZero(currentUser);
    alert('تم تصفير نقاط جميع أفراد الأسرة إلى 0 بنجاح. يمكنك الآن تقييم كل مهمة ومنح النقاط المناسبة.');
  };

  const handleConfirmReject = async () => {
    if (!taskToReject) return;
    await rejectTask(taskToReject, rejectionReasonInput.trim(), currentUser);
    setTaskToReject(null);
    setRejectionReasonInput('');
  };

  const handleAdjustPoints = async (isAddition: boolean) => {
    if (!pointsReason.trim()) {
      alert('يرجى كتابة سبب إضافة أو خصم النقاط للشفافية وتوثيق السجل.');
      return;
    }
    const delta = isAddition ? Math.abs(pointsDelta) : -Math.abs(pointsDelta);
    await adjustUserPoints(
      selectedUserForPoints,
      delta,
      isAddition ? 'add_points' : 'deduct_points',
      currentUser,
      pointsReason.trim()
    );
    if (isAddition) triggerCelebration(delta);
    setPointsReason('');
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardTitle.trim()) return;
    await createReward({
      title: rewardTitle.trim(),
      description: rewardDesc.trim(),
      points: Number(rewardPoints),
      category: rewardCategory,
      stock: -1,
    });
    setShowNewRewardModal(false);
    setRewardTitle('');
    setRewardDesc('');
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeTitle.trim()) return;
    await createChallenge({
      title: challengeTitle.trim(),
      description: challengeDesc.trim(),
      targetCount: Number(challengeTarget),
      currentCount: 0,
      rewardPoints: Number(challengeReward),
      type: challengeType,
      endDate: new Date(Date.now() + (challengeType === 'weekly' ? 86400000 * 7 : 86400000 * 30)).toISOString().split('T')[0],
      isActive: true,
    });
    setShowNewChallengeModal(false);
    setChallengeTitle('');
    setChallengeDesc('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    const targetUser = users.find((u) => u.uid === msgRecipientUid);
    await sendMessage({
      senderId: currentUser.uid,
      senderName: currentUser.name,
      senderRole: 'admin',
      recipientType: msgRecipientType,
      recipientId: msgRecipientType === 'user' ? msgRecipientUid : undefined,
      recipientName: msgRecipientType === 'user' ? targetUser?.name : undefined,
      title: msgTitle.trim() || 'رسالة توجيهية من الوالد',
      content: msgContent.trim(),
    });
    setMsgTitle('');
    setMsgContent('');
    alert('تم إرسال الرسالة بنجاح.');
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) return;
    await addNewMember({
      name: memberName.trim(),
      avatar: memberAvatar,
      initialPoints: 100,
      accessCode: memberAccessCode || Math.floor(1000 + Math.random() * 9000).toString(),
      isAllowed: true,
    });
    setShowNewMemberModal(false);
    setMemberName('');
    setMemberAccessCode('');
  };

  const handleTogglePermission = async (user: UserProfile) => {
    const current = user.isAllowed !== false;
    await toggleUserPermission(user.uid, !current, currentUser);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 text-right">
      
      {/* Top Admin Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-[0_4px_25px_-5px_rgba(15,40,71,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center text-2xl shadow-md shadow-sky-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#0F2847]">
                لوحة تحكم المدير (الوالد)
              </h1>
              <span className="text-xs bg-sky-100 text-sky-800 font-bold px-2 py-0.5 rounded-full">
                تحكم كامل
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة مهام وتحديات وجوائز ونقاط الأسرة بكل سهولة وسلاسة
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setShowNewTaskModal(true)}
            className="py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>مهمة جديدة</span>
          </button>
          <button
            onClick={() => setShowNewRewardModal(true)}
            className="py-2.5 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1 shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>جائزة جديدة</span>
          </button>
          <button
            onClick={() => setShowNewChallengeModal(true)}
            className="py-2.5 px-3.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-semibold text-xs sm:text-sm transition-all flex items-center gap-1 shrink-0"
          >
            <Flame className="w-4 h-4 text-orange-500" />
            <span>تحدي جديد</span>
          </button>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-sky-100 scrollbar-none">
        {[
          { id: 'overview', label: 'الرئيسية', icon: BarChart3, badge: submittedTasks.length },
          { id: 'approvals', label: 'طلبات الاعتماد', icon: CheckSquare, badge: submittedTasks.length },
          { id: 'tasks', label: 'المهام', icon: CheckCircle2 },
          { id: 'users', label: 'المستخدمون', icon: Users },
          { id: 'points', label: 'إدارة النقاط', icon: Star },
          { id: 'rewards', label: 'متجر الجوائز', icon: Award, badge: claims.filter(c => c.status === 'pending').length },
          { id: 'challenges', label: 'التحديات', icon: Flame },
          { id: 'messages', label: 'الرسائل', icon: Send },
          { id: 'reports', label: 'تقرير الإنجازات الأسبوعي 📊', icon: BarChart3 },
          { id: 'logs', label: 'سجل العمليات', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as typeof adminTab)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-900 border border-slate-200/70'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white text-sky-800' : 'bg-rose-500 text-white'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">

          {/* Weekly Report Hub Banner */}
          <div className="bg-gradient-to-r from-sky-800 via-sky-700 to-[#0F2847] rounded-3xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shrink-0">
                📊
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black mb-1">
                  <span>تقرير الإنجازات الأسبوعي</span>
                </div>
                <h4 className="text-base font-black">تلخيص أسبوعي لإنجازات الأبناء ونقاطهم</h4>
                <p className="text-xs text-sky-100 opacity-90 mt-0.5">
                  استعرض عدد المهام المنجزة لكل ابن ومجموع النقاط، وبث التقرير كرسالة تنبيه فورية داخل التطبيق.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAdminTab('reports')}
              className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <span>فتح وبث التقرير 📊</span>
            </button>
          </div>

          {/* Quick Share & Grant Permissions Card */}
          <div className="bg-gradient-to-r from-sky-50 via-white to-sky-50 rounded-3xl p-6 border-2 border-sky-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-sky-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-sm">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0F2847]">
                    إرسال التطبيق ومنح السماح للأبناء (أمية، أيمن، أنس)
                  </h3>
                  <p className="text-xs text-slate-500">
                    أنت المدير، وتتحكم بمنح أو تعليق الإذن لكل ابن وإرسال رابط الدخول المباشر له.
                  </p>
                </div>
              </div>

              <div className="text-left">
                <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
                  {familyMembersOnly.filter(m => m.isAllowed !== false).length} من {familyMembersOnly.length} مصرح لهم
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {familyMembersOnly.map((member) => {
                const isAllowed = member.isAllowed !== false;
                const isCopied = copiedUid === member.uid;
                return (
                  <div
                    key={member.uid}
                    className={`p-4 rounded-2xl border transition-all bg-white flex flex-col justify-between ${
                      isAllowed ? 'border-sky-200' : 'border-rose-200 bg-rose-50/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{member.avatar}</span>
                          <div>
                            <h4 className="font-bold text-sm text-[#0F2847]">{member.name}</h4>
                            <span className="text-[10px] text-slate-400">رمز الدخول: {member.accessCode || '1001'}</span>
                          </div>
                        </div>

                        {/* Allowed / Suspended Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isAllowed ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          {isAllowed ? 'مصرّح له' : 'معلّق الإذن'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(member)}
                          className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'تم النسخ!' : 'نسخ الرابط له'}</span>
                        </button>

                        <button
                          onClick={() => handleShareWhatsApp(member)}
                          className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                          title="إرسال عبر واتساب"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleTogglePermission(member)}
                        className={`w-full py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          isAllowed 
                            ? 'text-rose-600 hover:bg-rose-50' 
                            : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {isAllowed ? 'إيقاف الإذن مؤقتاً' : 'تفعيل ومنح السماح ✓'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500">طلبات بانتظار الاعتماد</span>
              <div className="text-3xl font-black text-sky-600 mt-2">
                {submittedTasks.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">مهام أنجزها الأبناء وتنتظر مراجعتك</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500">مجموع نقاط الأسرة</span>
              <div className="text-3xl font-black text-amber-500 mt-2">
                {totalFamilyPoints} ⭐
              </div>
              <p className="text-[11px] text-slate-400 mt-1">رصيد الأبناء الكلي التراكمي</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500">إجمالي المهام المنجزة</span>
              <div className="text-3xl font-black text-emerald-600 mt-2">
                {totalApproved}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">مهام معتمدة بنجاح</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
              <span className="text-xs font-bold text-slate-500">أفراد الأسرة المشاركون</span>
              <div className="text-3xl font-black text-[#0F2847] mt-2">
                {familyMembersOnly.length}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">أمية، أيمن، أنس وغيرهم</p>
            </div>
          </div>

          {/* Pending Submissions Queue */}
          <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-base text-[#0F2847]">
                  طلبات الاعتماد العاجلة ({submittedTasks.length})
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                راجع الإثبات واعتمد لإضافة النقاط تلقائياً
              </span>
            </div>

            {submittedTasks.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">لا توجد طلبات معلقة حالياً</p>
                <p className="text-xs text-slate-400 mt-0.5">تم اعتماد ومراجعة جميع المهام المسلّمة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {submittedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl bg-sky-50/50 border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F2847]">{t.title}</span>
                        <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                          +{t.points} ⭐
                        </span>
                        <span className="text-xs text-slate-500">
                          بواسطة: <strong>{t.assignedToName || 'أحد الأبناء'}</strong>
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {t.description}
                      </p>
                      {t.submissionProof && (
                        <div className="p-2.5 bg-white rounded-xl border border-sky-200 text-xs text-slate-800 mt-2">
                          <span className="font-bold text-slate-500 block mb-0.5">الإثبات المقدم:</span>
                          {t.submissionProof}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveTask(t)}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>اعتماد (+{t.points} ⭐)</span>
                      </button>
                      <button
                        onClick={() => setTaskToReject(t)}
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>رفض مع توضيح</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: APPROVALS */}
      {adminTab === 'approvals' && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#0F2847]">
                مراجعة واعتماد المهام المسلّمة وتقييم النقاط
              </h3>
              <p className="text-xs text-slate-500">
                النقاط تكون صفراً حتى تقوم أنت بوضع التقييم بالنجوم وتحديد النقاط المستحقة للإنجاز.
              </p>
            </div>
            <span className="text-xs font-bold text-sky-800 bg-sky-100 px-3 py-1 rounded-full">
              {submittedTasks.length} بانتظار الاعتماد
            </span>
          </div>

          {submittedTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">ممتاز! جميع المهام معتمدة ولا توجد أي طلبات معلقة.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submittedTasks.map((t) => (
                <div key={t.id} className="p-5 rounded-2xl border border-sky-100 bg-[#FBFDFF] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400">المرسل:</span>{' '}
                      <strong className="text-sm text-sky-900">{t.assignedToName || 'الجميع'}</strong>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
                      <span>النقاط يحددها تقييم الوالد ⭐</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-base text-[#0F2847]">{t.title}</h4>
                  <p className="text-xs text-slate-600">{t.description}</p>

                  <div className="p-3 bg-white rounded-xl border border-sky-200 text-xs text-slate-800">
                    <span className="font-bold text-sky-900 block mb-1">الإثبات والتأكيد من المستفيد:</span>
                    <p className="leading-relaxed">{t.submissionProof || 'لم يكتب تفاصيل إضافية'}</p>
                    <span className="text-[10px] text-slate-400 block mt-1">نوع الإثبات المطلوب: {t.proofType}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setTaskToReject(t)}
                      className="py-2 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>رفض الإنجاز</span>
                    </button>
                    <button
                      onClick={() => handleApproveTask(t)}
                      className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>تقييم واعتماد الإنجاز ⭐</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TASKS MANAGEMENT */}
      {adminTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-sky-100">
            <h3 className="font-bold text-base text-[#0F2847]">
              قائمة جميع المهام ({tasks.length})
            </h3>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مهمة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      +{task.points} ⭐
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {task.assigneeType === 'all' ? 'موجهة للجميع' : `موجهة إلى: ${task.assignedToName}`}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0F2847] mb-1">{task.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">{task.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">التسليم: {task.dueDate}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTaskToShareWhatsApp(task)}
                      className="py-1 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 transition-colors"
                      title="إرسال لجروب الواتساب أو الابن"
                    >
                      <span>واتساب</span>
                      <span>💬</span>
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="حذف المهمة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT */}
      {adminTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-sky-100">
            <div>
              <h3 className="font-bold text-base text-[#0F2847]">إدارة المستخدمين والأذونات</h3>
              <p className="text-xs text-slate-500">
                أنت المدير (الوالد) وبإمكانك إضافة الأبناء (أمية، أيمن، أنس)، وتحديد من يملك الإذن بالدخول، ومشاركة الروابط.
              </p>
            </div>
            <button
              onClick={() => setShowNewMemberModal(true)}
              className="py-2 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرد جديد للأسرة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((u) => {
              const isAdminUser = u.role === 'admin';
              const isAllowed = u.isAllowed !== false;
              const isCopied = copiedUid === u.uid;
              const userCompletedTasks = tasks.filter(t => (t.assignedToUid === u.uid || t.assigneeType === 'all') && t.status === 'approved').length;

              return (
                <div key={u.uid} className={`bg-white p-5 rounded-3xl border shadow-xs text-center relative flex flex-col justify-between ${
                  !isAllowed ? 'border-rose-200 bg-rose-50/20' : 'border-sky-100'
                }`}>
                  <div>
                    {isAdminUser ? (
                      <span className="absolute top-4 left-4 text-[10px] bg-sky-600 text-white font-bold px-2 py-0.5 rounded-full">
                        المدير (أنت)
                      </span>
                    ) : (
                      <span className={`absolute top-4 left-4 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAllowed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isAllowed ? 'مسموح له' : 'معلّق'}
                      </span>
                    )}

                    <div className="w-16 h-16 rounded-2xl bg-sky-50 text-3xl mx-auto flex items-center justify-center mb-3 border border-sky-100">
                      {u.avatar}
                    </div>
                    <h4 className="font-extrabold text-base text-[#0F2847]">{u.name}</h4>
                    <p className="text-xs text-sky-700 font-semibold mb-3">{u.levelTitle}</p>

                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-xs mb-3">
                      <div>
                        <span className="text-slate-400 block text-[10px]">النقاط</span>
                        <strong className="text-amber-600 text-sm">{u.points} ⭐</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">المستوى</span>
                        <strong className="text-slate-700 text-sm">{u.level}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">المهام</span>
                        <strong className="text-emerald-600 text-sm">{userCompletedTasks}</strong>
                      </div>
                    </div>
                  </div>

                  {!isAdminUser && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyLink(u)}
                          className="flex-1 py-1.5 px-2 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isCopied ? 'تم النسخ!' : 'رابط الدخول'}</span>
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(u)}
                          className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          title="إرسال عبر واتساب"
                        >
                          <Send className="w-3 h-3" />
                          <span>واتساب</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleTogglePermission(u)}
                        className={`w-full py-1.5 rounded-xl text-xs font-bold transition-all ${
                          isAllowed
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {isAllowed ? 'تعليق إذن الدخول' : 'منح السماح بالدخول ✓'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: POINTS MANAGEMENT */}
      {adminTab === 'points' && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-base text-[#0F2847] flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>إدارة وتعديل رصيد النقاط والتقييم</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                النقاط تكون صفراً وتبدأ من الصفر، وأنت الذي تحدد النقاط بالتقييم لكل مهمة.
              </p>
            </div>

            <button
              onClick={handleResetAllMembersPoints}
              className="py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors self-start sm:self-auto shrink-0"
              title="تصفير نقاط الجميع للبدء من 0"
            >
              تصفير نقاط الجميع إلى 0 🔄
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اختر فرد الأسرة:
              </label>
              <select
                value={selectedUserForPoints}
                onChange={(e) => setSelectedUserForPoints(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-sky-200 text-sm bg-white font-bold text-[#0F2847]"
              >
                {familyMembersOnly.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.name} (الرصيد الحالي: {u.points} نقطة)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                مقدار النقاط:
              </label>
              <div className="flex items-center gap-2">
                {[10, 25, 50, 100].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPointsDelta(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      pointsDelta === num 
                        ? 'bg-sky-600 text-white border-sky-600' 
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'
                    }`}
                  >
                    {num} ⭐
                  </button>
                ))}
                <input
                  type="number"
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                  className="w-24 p-1.5 rounded-lg border border-sky-200 text-center font-bold text-sm"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                السبب والمناسبة (مطلوب لتوثيق السجل):
              </label>
              <input
                type="text"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="مثال: مكافأة التميز في الاختبار، إكرام الضيوف، المبادرة الطيبة..."
                className="w-full p-2.5 rounded-xl border border-sky-200 text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="pt-3 flex gap-3">
              <button
                onClick={() => handleAdjustPoints(true)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة النقاط (+{pointsDelta} ⭐)</span>
              </button>
              <button
                onClick={() => handleAdjustPoints(false)}
                className="flex-1 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>خصم النقاط (-{pointsDelta} ⭐)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REWARDS STORE MANAGEMENT */}
      {adminTab === 'rewards' && (
        <div className="space-y-6">
          {/* Pending Claims Section */}
          <div className="bg-white p-5 rounded-2xl border border-sky-100">
            <h3 className="font-bold text-base text-[#0F2847] mb-3">
              طلبات استبدال الجوائز ({claims.length})
            </h3>
            {claims.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">لا توجد طلبات استبدال حتى الآن</p>
            ) : (
              <div className="space-y-2">
                {claims.map((claim) => (
                  <div key={claim.id} className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{claim.userName}</span> استبدل: <strong className="text-sky-900">{claim.rewardTitle}</strong> مقابل {claim.pointsSpent} ⭐
                    </div>
                    {claim.status === 'delivered' ? (
                      <span className="text-emerald-700 font-bold">تم التسليم ✓</span>
                    ) : (
                      <button
                        onClick={() => deliverClaim(claim.id, currentUser)}
                        className="py-1 px-3 bg-emerald-600 text-white font-bold rounded-lg"
                      >
                        تسليم الجائزة
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Rewards List */}
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#0F2847]">جوائز المتجر ({rewards.length})</h3>
            <button
              onClick={() => setShowNewRewardModal(true)}
              className="py-2 px-3.5 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة جائزة جديدة</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {rewards.map((r) => (
              <div key={r.id} className="bg-white p-4 rounded-2xl border border-sky-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      {r.points} ⭐
                    </span>
                    <span className="text-[11px] text-slate-400">{r.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0F2847] mb-1">{r.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{r.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 text-left">
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="text-xs text-rose-500 hover:text-rose-700"
                  >
                    حذف الجائزة
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CHALLENGES */}
      {adminTab === 'challenges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-sky-100">
            <h3 className="font-bold text-base text-[#0F2847]">التحديات الأسبوعية والشهرية</h3>
            <button
              onClick={() => setShowNewChallengeModal(true)}
              className="py-2 px-4 rounded-xl bg-sky-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء تحدٍ جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {challenges.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                    {c.type === 'weekly' ? 'تحدي أسبوعي' : 'تحدي شهري'}
                  </span>
                  <span className="text-xs font-bold text-amber-600">
                    مكافأة: +{c.rewardPoints} ⭐
                  </span>
                </div>
                <h4 className="font-bold text-base text-[#0F2847] mb-1">{c.title}</h4>
                <p className="text-xs text-slate-600 mb-3">{c.description}</p>
                <div className="text-xs text-slate-400">ينتهي في: {c.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: MESSAGES */}
      {adminTab === 'messages' && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs max-w-2xl mx-auto space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#0F2847]">إرسال رسالة داخلية</h3>
            <p className="text-xs text-slate-500">أرسل توجيهاً أو كلمة طيبة لأحد الأبناء أو للجميع</p>
          </div>

          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الوجهة:</label>
              <div className="flex gap-4 text-xs font-semibold">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={msgRecipientType === 'all'}
                    onChange={() => setMsgRecipientType('all')}
                  />
                  <span>إلى جميع أفراد الأسرة 📢</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={msgRecipientType === 'user'}
                    onChange={() => setMsgRecipientType('user')}
                  />
                  <span>إلى شخص محدد</span>
                </label>
              </div>
            </div>

            {msgRecipientType === 'user' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اختر المستلم:</label>
                <select
                  value={msgRecipientUid}
                  onChange={(e) => setMsgRecipientUid(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                >
                  {familyMembersOnly.map((u) => (
                    <option key={u.uid} value={u.uid}>{u.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الرسالة:</label>
              <input
                type="text"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                placeholder="توجيه أسبوعي، كلمة تشجيع، ملاحظة..."
                className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نص الرسالة:</label>
              <textarea
                value={msgContent}
                onChange={(e) => setMsgContent(e.target.value)}
                rows={4}
                placeholder="اكتب رسالتك هنا..."
                className="w-full p-3 rounded-xl border border-sky-200 text-xs"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>إرسال الرسالة الآن</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 9: WEEKLY ACHIEVEMENTS REPORT */}
      {adminTab === 'reports' && (
        <WeeklyReportView
          users={users}
          tasks={tasks}
          currentUser={currentUser}
        />
      )}

      {/* TAB 10: AUDIT LOG */}
      {adminTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#0F2847]">سجل العمليات الإدارية (Audit Log)</h3>
            <p className="text-xs text-slate-500">
              توثيق دقيق لكل عملية: اسم المنفذ، نوع العملية، المستخدم المتأثر، النقاط، والتاريخ.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2.5 px-3">المنفذ</th>
                  <th className="py-2.5 px-3">نوع العملية</th>
                  <th className="py-2.5 px-3">المتأثر</th>
                  <th className="py-2.5 px-3">التفاصيل / السبب</th>
                  <th className="py-2.5 px-3">التاريخ والوقت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-sky-50/50">
                    <td className="py-2.5 px-3 font-bold text-[#0F2847]">{log.performerName}</td>
                    <td className="py-2.5 px-3">
                      <span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md font-semibold">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{log.targetUserName || '-'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{log.reason}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString('ar-SA')} - {new Date(log.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TASK */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-[#0F2847] mb-4">إنشاء مهمة جديدة</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المهمة:</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثال: قراءة صفحتين من القرآن، ترتيب الغرفة..."
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف:</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="شرح متطلبات المهمة بالتفصيل..."
                  rows={3}
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    النقاط المبدئية (0 حتى تقييمها):
                  </label>
                  <input
                    type="number"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Math.max(0, Number(e.target.value)))}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs font-bold"
                    min="0"
                    placeholder="0"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    تبقى 0 حتى تضع تقييمك بعد الإنجاز
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصعوبة:</label>
                  <select
                    value={taskDifficulty}
                    onChange={(e) => setTaskDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">بطولي</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التعيين:</label>
                  <select
                    value={taskAssigneeType}
                    onChange={(e) => setTaskAssigneeType(e.target.value as 'all' | 'specific')}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  >
                    <option value="all">الجميع</option>
                    <option value="specific">شخص محدد</option>
                  </select>
                </div>

                {taskAssigneeType === 'specific' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">المستفيد:</label>
                    <select
                      value={taskAssignedUid}
                      onChange={(e) => setTaskAssignedUid(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                    >
                      {familyMembersOnly.map((u) => (
                        <option key={u.uid} value={u.uid}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التسليم:</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الإثبات:</label>
                  <select
                    value={taskProofType}
                    onChange={(e) => setTaskProofType(e.target.value as 'photo' | 'video' | 'text' | 'any')}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  >
                    <option value="text">نص</option>
                    <option value="photo">صورة</option>
                    <option value="video">فيديو</option>
                    <option value="any">أي إثبات</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl"
                >
                  حفظ ونشر المهمة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REJECT TASK */}
      {taskToReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-rose-700 mb-2">رفض المهمة وإعادتها للتعديل</h3>
            <p className="text-xs text-slate-600 mb-3">
              اكتب ملاحظة تشجيعية توضح ما ينقص الإنجاز ليعيده المستفيد بشكل صحيح.
            </p>
            <textarea
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="مثال: يرجى ترتيب المكتب ومسحه بشكل أفضل وإعادة الإرسال..."
              rows={3}
              className="w-full p-3 rounded-xl border border-rose-200 text-xs mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl"
              >
                تأكيد الرفض
              </button>
              <button
                onClick={() => setTaskToReject(null)}
                className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE REWARD */}
      {showNewRewardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-[#0F2847] mb-3">إضافة جائزة جديدة لمتجر الأسرة</h3>
            <form onSubmit={handleCreateReward} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الجائزة:</label>
                <input
                  type="text"
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="مثال: اختيار فيلم السهرة العائلي"
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف:</label>
                <textarea
                  value={rewardDesc}
                  onChange={(e) => setRewardDesc(e.target.value)}
                  placeholder="تفاصيل الجائزة..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النقاط المطلوبة:</label>
                  <input
                    type="number"
                    value={rewardPoints}
                    onChange={(e) => setRewardPoints(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs font-bold"
                    min="10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف:</label>
                  <input
                    type="text"
                    value={rewardCategory}
                    onChange={(e) => setRewardCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl"
                >
                  إضافة الجائزة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewRewardModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE CHALLENGE */}
      {showNewChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full">
            <h3 className="text-base font-bold text-[#0F2847] mb-3">إنشاء تحدٍ جديد</h3>
            <form onSubmit={handleCreateChallenge} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان التحدي:</label>
                <input
                  type="text"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                  placeholder="مثال: تحدي الأسبوع: أنجز 5 مهام"
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوصف:</label>
                <textarea
                  value={challengeDesc}
                  onChange={(e) => setChallengeDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المكافأة (⭐):</label>
                  <input
                    type="number"
                    value={challengeReward}
                    onChange={(e) => setChallengeReward(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">النوع:</label>
                  <select
                    value={challengeType}
                    onChange={(e) => setChallengeType(e.target.value as 'weekly' | 'monthly')}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  >
                    <option value="weekly">أسبوعي</option>
                    <option value="monthly">شهري</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl"
                >
                  نشر التحدي
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewChallengeModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD MEMBER */}
      {showNewMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-[#0F2847] mb-3">إضافة فرد جديد للأسرة</h3>
            <form onSubmit={handleAddMember} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الاسم:</label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="اسم الابن أو الابنة..."
                  className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الأيقونة (الرمز التعبيري):</label>
                <div className="flex gap-2">
                  {['👦', '🧑', '🧒', '👧', '👶', '🌟'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setMemberAvatar(em)}
                      className={`text-xl p-2 rounded-xl border ${memberAvatar === em ? 'border-sky-600 bg-sky-50' : 'border-slate-200'}`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewMemberModal(false)}
                  className="py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WHATSAPP SHARE */}
      {taskToShareWhatsApp && (
        <WhatsAppShareModal
          task={taskToShareWhatsApp}
          users={users}
          onClose={() => setTaskToShareWhatsApp(null)}
        />
      )}

      {/* MODAL: TASK EVALUATION (FATHER SETS SCORE & STARS) */}
      {taskToEvaluate && (
        <TaskEvaluationModal
          task={taskToEvaluate}
          onConfirmApprove={handleConfirmEvaluation}
          onClose={() => setTaskToEvaluate(null)}
        />
      )}

    </div>
  );
};
