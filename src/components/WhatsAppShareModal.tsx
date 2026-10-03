import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Users, User, Share2 } from 'lucide-react';
import { Task, UserProfile } from '../types';

interface WhatsAppShareModalProps {
  task: Task;
  users: UserProfile[];
  onClose: () => void;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  task,
  users,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const appBaseUrl = window.location.origin;

  const targetMember = users.find((u) => u.uid === task.assignedToUid);
  const assigneeLabel = task.assigneeType === 'all' ? 'جميع أفراد الأسرة 📢' : (targetMember?.name || 'أحد الأبناء');
  
  const directLink = task.assigneeType === 'all' 
    ? appBaseUrl 
    : `${appBaseUrl}?user=${task.assignedToUid}`;

  const messageText = 
`🏆 *تحدّي العائلة | مهمة جديدة من الوالد* 🏆

📋 *المهمة:* ${task.title}
📝 *التفاصيل:* ${task.description || 'إنجاز المطلوب وفق توجيهات الوالد'}
⭐ *المكافأة:* +${task.points} نقطة
📅 *موعد التسليم:* ${task.dueDate}
🎯 *المستفيد:* ${assigneeLabel}
🔍 *نوع الإثبات المطلوبة:* ${task.proofType === 'photo' ? 'صورة إثبات' : task.proofType === 'video' ? 'فيديو' : task.proofType === 'text' ? 'كتابة نص' : 'أي إثبات'}

📲 *رابط فتح المهمة في التطبيق:*
${directLink}

همتكم العالية يا أبطال! بالتوفيق والتميز دائماً ✨`;

  const handleShareGroup = () => {
    const encoded = encodeURIComponent(messageText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full text-right relative shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-sky-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 text-xl">
            💬
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#0F2847]">
              إرسال المهمة عبر واتساب
            </h3>
            <p className="text-xs text-slate-500">
              أرسل المهمة إلى جروب العائلة في الواتساب أو إلى الابن مباشرة
            </p>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-4 text-xs font-sans text-slate-800 leading-relaxed whitespace-pre-line select-all">
          {messageText}
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleShareGroup}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 transition-all"
          >
            <Users className="w-4 h-4" />
            <span>إرسال إلى جروب العائلة في واتساب 💬</span>
          </button>

          {task.assigneeType === 'specific' && targetMember && (
            <button
              onClick={handleShareGroup}
              className="w-full py-2.5 px-4 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center gap-2 border border-sky-200 transition-all"
            >
              <User className="w-4 h-4 text-sky-600" />
              <span>إرسال لـ {targetMember.name} في محادثة خاصة</span>
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم نسخ الرسالة بنجاح ✓' : 'نسخ نص الرسالة'}</span>
            </button>

            <button
              onClick={onClose}
              className="py-2.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
