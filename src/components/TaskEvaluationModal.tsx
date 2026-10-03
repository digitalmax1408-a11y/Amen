import React, { useState } from 'react';
import { X, Star, Award, CheckCircle2, MessageSquare, Sparkles } from 'lucide-react';
import { Task, UserProfile } from '../types';

interface TaskEvaluationModalProps {
  task: Task;
  onConfirmApprove: (task: Task, evaluation: { awardedPoints: number; rating: number; feedback: string }) => void;
  onClose: () => void;
}

export const TaskEvaluationModal: React.FC<TaskEvaluationModalProps> = ({
  task,
  onConfirmApprove,
  onClose,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [points, setPoints] = useState<number>(task.points > 0 ? task.points : 50);
  const [feedback, setFeedback] = useState<string>('ما شاء الله، إنجاز متميز ومتقن! استمر يا بطل ✨');

  const presetPoints = [15, 25, 50, 75, 100];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmApprove(task, {
      awardedPoints: Math.max(0, Number(points)),
      rating,
      feedback: feedback.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full text-right relative shadow-2xl border border-sky-100 max-h-[90vh] overflow-y-auto">
        
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0 text-2xl">
            ⭐
          </div>
          <div>
            <h3 className="font-extrabold text-base text-[#0F2847]">
              تقييم إنجاز الابن وتحديد النقاط
            </h3>
            <p className="text-xs text-slate-500">
              النقاط صفر حتى تقوم أنت كمدير بتقييم الإنجاز وتحديد ما يستحقه الابن
            </p>
          </div>
        </div>

        {/* Task & Child Summary Card */}
        <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-100 mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0F2847]">المهمة: {task.title}</span>
            <span className="text-sky-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-sky-200">
              المُنجز: {task.assignedToName || 'أحد الأبناء'}
            </span>
          </div>

          {task.submissionProof && (
            <div className="mt-2 pt-2 border-t border-sky-100 text-xs">
              <span className="font-semibold text-slate-600 block mb-1">إثبات الإنجاز المُرسل من الابن:</span>
              <p className="bg-white p-2.5 rounded-xl border border-sky-200 text-slate-800 font-sans leading-relaxed">
                "{task.submissionProof}"
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star Rating Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              تقييمك لجودة الإنجاز:
            </label>
            <div className="flex items-center justify-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-black text-amber-700 mr-2">
                ({rating} من 5 نجوم)
              </span>
            </div>
          </div>

          {/* Points Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                النقاط التي تمنحها للابن بناءً على تقييمك:
              </label>
              <span className="text-xs font-extrabold text-amber-600">
                +{points} ⭐
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {presetPoints.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPoints(p)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                    points === p
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  +{p} ⭐
                </button>
              ))}
            </div>

            <input
              type="number"
              min="0"
              max="1000"
              value={points}
              onChange={(e) => setPoints(Math.max(0, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl border border-sky-200 text-sm font-bold text-center text-[#0F2847]"
              placeholder="اكتب عدد النقاط..."
              required
            />
          </div>

          {/* Encouraging Feedback Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رسالة تشجيعية أو توجيه للابن (اختياري):
            </label>
            <input
              type="text"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="مثال: أحسنت وبارك الله فيك، عمل متقن..."
              className="w-full p-2.5 rounded-xl border border-sky-200 text-xs"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>اعتماد التقييم وإضافة (+{points} ⭐)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
