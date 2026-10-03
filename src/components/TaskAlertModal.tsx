import React from 'react';
import { X, Calendar, Star, CheckSquare, Sparkles, ChevronLeft } from 'lucide-react';
import { Task } from '../types';

interface TaskAlertModalProps {
  task: Task;
  onOpenTask: (task: Task) => void;
  onClose: () => void;
}

export const TaskAlertModal: React.FC<TaskAlertModalProps> = ({
  task,
  onOpenTask,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-sky-300 max-w-sm w-full p-6 text-right relative overflow-hidden transform animate-in zoom-in-95">
        
        {/* Decorative Top Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-sky-100 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white flex items-center justify-center text-2xl shadow-md shadow-sky-600/25 shrink-0">
            📋
          </div>
          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>تنبيه مهمة جديدة!</span>
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#0F2847] mt-0.5">
              أضاف الوالد مهمة جديدة
            </h3>
          </div>
        </div>

        {/* Task Details Card */}
        <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#0F2847] leading-snug">
              {task.title}
            </h4>
            <span className="font-black text-xs text-amber-600 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shrink-0 mr-2">
              +{task.points} ⭐
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>

          <div className="pt-2 border-t border-sky-100 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sky-600" />
              <span>موعد التسليم: {task.dueDate}</span>
            </div>
            <span className="text-sky-800 font-semibold">
              {task.assigneeType === 'all' ? 'للجميع' : 'خاصة بك'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onOpenTask(task);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-sky-600/20 transition-all"
          >
            <span>عرض المهمة وبدء الإنجاز</span>
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl text-slate-500 hover:bg-slate-100 text-xs font-semibold"
          >
            لاحقاً
          </button>
        </div>

      </div>
    </div>
  );
};
