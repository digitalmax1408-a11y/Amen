import React from 'react';
import { Star, Sparkles, X, CheckCircle2 } from 'lucide-react';

interface CelebrationModalProps {
  points: number;
  message?: string;
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  points,
  message,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border-2 border-sky-200 max-w-sm w-full p-6 text-center relative overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-sky-200/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-200/50 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-sky-400 p-0.5 shadow-lg shadow-sky-500/25 mb-4 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <span className="text-4xl animate-bounce">🏆</span>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
          <Star className="w-3.5 h-3.5 fill-amber-500" />
          <span>+{points} نقطة إضافية</span>
        </div>

        <h3 className="text-xl font-extrabold text-[#0F2847] mb-2">
          مبروك يا بطل!
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {message || `مبروك! تمت إضافة ${points} نقطة إلى رصيدك تقديراً لإنجازك المميز.`}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white font-bold text-sm shadow-md shadow-sky-600/25 transition-all transform active:scale-98 flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>رائع، شكراً لك!</span>
        </button>
      </div>
    </div>
  );
};
