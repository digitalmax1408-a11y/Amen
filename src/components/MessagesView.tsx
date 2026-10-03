import React, { useState } from 'react';
import { Mail, Send, CheckCheck, User, Users, Clock, Sparkles } from 'lucide-react';
import { Message, UserProfile } from '../types';
import { sendMessage, markMessageRead } from '../lib/familyStore';

interface MessagesViewProps {
  currentUser: UserProfile;
  messages: Message[];
  users: UserProfile[];
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  currentUser,
  messages,
  users,
}) => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'compose'>('inbox');
  const [recipientUid, setRecipientUid] = useState<string>(
    currentUser.role === 'admin' ? (users[1]?.uid || '') : 'admin_father'
  );
  const [recipientType, setRecipientType] = useState<'all' | 'user'>('user');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Filter messages for inbox:
  // Either recipientType === 'all' OR recipientId === currentUser.uid OR senderId === currentUser.uid
  const myMessages = messages.filter(
    (m) => m.recipientType === 'all' || m.recipientId === currentUser.uid || m.senderId === currentUser.uid
  );

  const unreadMessagesCount = myMessages.filter(
    (m) => m.senderId !== currentUser.uid && (!m.readBy || !m.readBy.includes(currentUser.uid))
  ).length;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      setIsSending(true);
      const targetUser = users.find((u) => u.uid === recipientUid);
      await sendMessage({
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        recipientType: currentUser.role === 'admin' ? recipientType : 'user',
        recipientId: currentUser.role === 'admin' ? (recipientType === 'user' ? recipientUid : undefined) : 'admin_father',
        recipientName: currentUser.role === 'admin' ? (recipientType === 'user' ? targetUser?.name : 'الجميع') : 'الوالد (المدير)',
        title: title.trim() || 'رسالة عائلية',
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      setActiveTab('inbox');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-right">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-sky-700 via-sky-600 to-[#0F2847] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-semibold mb-3 border border-white/20">
            <Mail className="w-3.5 h-3.5 text-amber-300" />
            <span>التواصل الأسري الهادف</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            ✉️ صندوق الوارد والرسائل
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm max-w-lg leading-relaxed opacity-90">
            رسائل توجيهية وتشجيعية وتواصل مباشر ومستمر بين أفراد الأسرة.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'inbox'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            صندوق الوارد ({unreadMessagesCount} غير مقروء)
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'compose'
                ? 'bg-white text-sky-900 shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            كتابة رسالة جديدة
          </button>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'inbox' ? (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-[0_4px_25px_-5px_rgba(15,40,71,0.06)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-[#0F2847]">
              الرسائل الواردة ({myMessages.length})
            </h3>
            <span className="text-xs text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full font-semibold">
              {unreadMessagesCount} رسائل غير مقروءة
            </span>
          </div>

          {myMessages.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Mail className="w-12 h-12 text-sky-200 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">لا توجد رسائل حالياً</p>
              <p className="text-xs text-slate-400 mt-0.5">يمكنك كتابة رسالة جديدة للوالد أو لأحد الإخوة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myMessages.map((msg) => {
                const isFromMe = msg.senderId === currentUser.uid;
                const isRead = msg.readBy && msg.readBy.includes(currentUser.uid);

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      if (!isFromMe && !isRead) {
                        markMessageRead(msg.id, currentUser.uid, msg.readBy || []);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      !isFromMe && !isRead
                        ? 'border-sky-300 bg-sky-50/60 shadow-xs'
                        : 'border-slate-100 hover:border-sky-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                          {isFromMe ? 'أنت' : msg.senderName.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-xs sm:text-sm text-[#0F2847]">
                            {isFromMe ? `إلى: ${msg.recipientName || 'الجميع'}` : `من: ${msg.senderName}`}
                          </span>
                          {msg.recipientType === 'all' && (
                            <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-md mr-2">
                              رسالة عامة للأسرة
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(msg.createdAt).toLocaleDateString('ar-SA')}</span>
                        {!isFromMe && !isRead && (
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                        )}
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-[#0F2847] mb-1">
                      {msg.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {msg.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs max-w-xl mx-auto">
          <h3 className="font-extrabold text-base text-[#0F2847] mb-4 pb-3 border-b border-slate-100">
            كتابة رسالة جديدة
          </h3>

          <form onSubmit={handleSendMessage} className="space-y-4">
            {currentUser.role === 'admin' ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوجهة:</label>
                <div className="flex gap-4 text-xs font-semibold mb-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={recipientType === 'all'}
                      onChange={() => setRecipientType('all')}
                    />
                    <span>إلى جميع أفراد الأسرة 📢</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={recipientType === 'user'}
                      onChange={() => setRecipientType('user')}
                    />
                    <span>إلى شخص محدد</span>
                  </label>
                </div>

                {recipientType === 'user' && (
                  <select
                    value={recipientUid}
                    onChange={(e) => setRecipientUid(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
                  >
                    {users.filter(u => u.uid !== currentUser.uid).map((u) => (
                      <option key={u.uid} value={u.uid}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">إلى:</label>
                <div className="p-2.5 bg-sky-50 rounded-xl text-xs font-bold text-sky-900 border border-sky-100">
                  الوالد (المدير)
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">العنوان:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الرسالة..."
                className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نص الرسالة:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="اكتب رسالتك بأسلوب راقٍ ومحبب..."
                className="w-full p-3 rounded-xl border border-sky-200 text-xs"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isSending}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'جارِ الإرسال...' : 'إرسال الرسالة'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
