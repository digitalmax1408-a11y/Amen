import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Send, 
  FileText, 
  Camera, 
  Upload, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { Task, UserProfile } from '../types';
import { startTask, submitTaskProof } from '../lib/familyStore';

interface TaskDetailModalProps {
  task: Task | null;
  onClose: () => void;
  currentUser: UserProfile;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  currentUser,
}) => {
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoSelected, setPhotoSelected] = useState<string | null>(null);

  if (!task) return null;

  const handleStart = async () => {
    try {
      await startTask(task.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofText.trim() && !photoSelected && task.proofType !== 'any') {
      alert('يرجى تقديم إثبات الإنجاز (نص أو صورة).');
      return;
    }
    try {
      setIsSubmitting(true);
      const proofCombined = photoSelected 
        ? `${proofText.trim()} [مرفق صورة إثبات]` 
        : proofText.trim() || 'تم الإنجاز وفق المطلوب';
      await submitTaskProof(task.id, proofCombined, task.proofType, currentUser);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    switch (task.status) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-semibold">مهمة جديدة لم تبدأ</span>;
      case 'in_progress':
        return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-1 rounded-full text-xs font-semibold">جارية الآن</span>;
      case 'submitted':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full text-xs font-semibold">بانتظار اعتماد المدير ⏳</span>;
      case 'approved':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">معتمدة ومكتملة ✓</span>;
      case 'rejected':
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-xs font-semibold">مرفوضة / تحتاج تعديل</span>;
    }
  };

  const getDifficultyText = () => {
    switch (task.difficulty) {
      case 'easy': return 'سهلة (مهمة سريعة)';
      case 'medium': return 'متوسطة (تتطلب تركيز)';
      case 'hard': return 'بطولية (تحدٍ فائق)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-lg w-full p-6 text-right relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center text-xl shrink-0">
            📋
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge()}
              <span className="text-xs text-slate-400">
                {task.assigneeType === 'all' ? 'موجهة للجميع' : `موجهة إلى: ${task.assignedToName || 'أنت'}`}
              </span>
            </div>
            <h3 className="text-lg font-black text-[#0F2847] leading-snug">
              {task.title}
            </h3>
          </div>
        </div>

        {/* Task Details Metadata Card */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-[#F8FBFE] rounded-2xl border border-sky-100/70 mb-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            <span>المكافأة: <strong className="text-sky-800 font-bold text-sm">+{task.points} ⭐</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
            <span>التسليم: <strong className="text-slate-700">{task.dueDate}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>الصعوبة: <strong className="text-slate-700">{getDifficultyText()}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>نوع الإثبات: <strong className="text-slate-700">{task.proofType === 'photo' ? 'صورة' : task.proofType === 'video' ? 'فيديو' : task.proofType === 'text' ? 'نص' : 'أي إثبات'}</strong></span>
          </div>
        </div>

        {/* Task Description */}
        <div className="mb-5">
          <h4 className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
            تفاصيل ومطلوب المهمة:
          </h4>
          <p className="text-sm text-[#0F2847] leading-relaxed p-3.5 bg-white rounded-2xl border border-slate-100 whitespace-pre-line">
            {task.description}
          </p>
        </div>

        {/* If Rejected: Show Reason */}
        {task.status === 'rejected' && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>ملاحظة المدير (الوالد):</span>
            </div>
            <p className="leading-relaxed">
              {task.rejectionReason || 'يرجى استكمال متطلبات المهمة وإعادة تقديم الإثبات'}
            </p>
          </div>
        )}

        {/* If Submitted: Show Pending State */}
        {task.status === 'submitted' && (
          <div className="mb-5 p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 text-xs">
            <div className="flex items-center gap-2 font-bold mb-1.5">
              <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>بانتظار اعتماد المدير</span>
            </div>
            <p className="text-slate-600 leading-relaxed mb-2">
              تم إرسال إثباتك للمدير للمراجعة. ستتم إضافة <strong>+{task.points} نقطة</strong> إلى رصيدك فور اعتمادها.
            </p>
            {task.submissionProof && (
              <div className="p-2.5 bg-white rounded-xl border border-indigo-100 text-slate-700">
                <span className="font-bold text-slate-500 block mb-0.5">الإثبات المقدم:</span>
                {task.submissionProof}
              </div>
            )}
          </div>
        )}

        {/* If Approved: Show Success */}
        {task.status === 'approved' && (
          <div className="mb-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">مهمة معتمدة بنجاح!</p>
              <p className="text-emerald-700 mt-0.5">
                تمت إضافة +{task.points} نقطة إلى رصيدك. أحسنت عملاً!
              </p>
            </div>
          </div>
        )}

        {/* Interactive Actions for Member */}
        {task.status === 'pending' && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={handleStart}
              className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ابدأ المهمة الآن</span>
            </button>
          </div>
        )}

        {(task.status === 'in_progress' || task.status === 'rejected') && (
          <form onSubmit={handleSubmitProof} className="pt-3 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تأكيد الإنجاز وإرفاق الإثبات:
              </label>
              <textarea
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                placeholder="اكتب ملاحظة توضح كيف أنجزت المهمة..."
                rows={3}
                className="w-full p-3 rounded-2xl border border-sky-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
              />
            </div>

            {/* Photo / Attachment Option */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPhotoSelected(photoSelected ? null : 'photo_attached_success.jpg')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  photoSelected 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-sky-50'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{photoSelected ? 'تم إرفاق صورة الإثبات ✓' : 'إرفاق صورة إثبات'}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جارِ الإرسال...' : 'تم إنجاز المهمة (إرسال للاعتماد)'}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              * لن تضاف النقاط إلا بعد اعتماد المدير (الوالد).
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
