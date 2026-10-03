import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  Sparkles, 
  Gift, 
  Car, 
  Utensils, 
  Gamepad2, 
  CheckCircle2, 
  ShoppingBag,
  AlertCircle
} from 'lucide-react';
import { Reward, UserProfile, RewardClaim } from '../types';
import { claimReward } from '../lib/familyStore';
import { triggerCelebration } from '../lib/celebration';

interface RewardsStoreProps {
  currentUser: UserProfile;
  rewards: Reward[];
  claims: RewardClaim[];
  isAdmin: boolean;
}

export const RewardsStore: React.FC<RewardsStoreProps> = ({
  currentUser,
  rewards,
  claims,
  isAdmin,
}) => {
  const [selectedRewardToClaim, setSelectedRewardToClaim] = useState<Reward | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const myClaims = claims.filter((c) => c.userId === currentUser.uid);

  const getRewardIcon = (category?: string, iconKey?: string) => {
    switch (iconKey || category) {
      case 'Car':
      case 'رحلات وترفيه':
        return <Car className="w-8 h-8 text-sky-600" />;
      case 'Utensils':
      case 'طعام ومرح':
        return <Utensils className="w-8 h-8 text-amber-600" />;
      case 'Gamepad2':
      case 'إلكترونيات':
        return <Gamepad2 className="w-8 h-8 text-indigo-600" />;
      case 'Gift':
      case 'هدايا قيمة':
        return <Gift className="w-8 h-8 text-rose-600" />;
      default:
        return <Sparkles className="w-8 h-8 text-sky-600" />;
    }
  };

  const handleClaim = async () => {
    if (!selectedRewardToClaim) return;
    try {
      setIsProcessing(true);
      await claimReward(selectedRewardToClaim, currentUser);
      triggerCelebration();
      setSuccessMessage(`تم تقديم طلب استبدال «${selectedRewardToClaim.title}» بنجاح! سيتم تسليمها لك قريباً.`);
      setSelectedRewardToClaim(null);
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الاستبدال');
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(rewards.map(r => r.category || 'عام')))];

  const filteredRewards = rewards.filter((r) => {
    if (filterCategory === 'all') return true;
    return (r.category || 'عام') === filterCategory;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-12 text-right">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-sky-800 via-sky-700 to-[#0F2847] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-sky-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-100 text-xs font-semibold mb-3 border border-white/20">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>مكافآت واستحقاقات التميز</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            🎁 متجر الجوائز العائلية
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm max-w-lg leading-relaxed opacity-90">
            استبدل نقاطك التي جمعتها بجهدك والتزامك بجوائز وتجارب حصرية وممتعة.
          </p>
        </div>

        {/* User Balance Card */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0 min-w-44">
          <span className="text-xs text-sky-200 block mb-1">رصيدك المتاح الحالي:</span>
          <div className="text-3xl font-black text-amber-300 flex items-center justify-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-300 text-amber-300" />
            <span>{currentUser.points}</span>
          </div>
          <span className="text-[11px] text-sky-200 mt-1 block">نقطة للاستبدال</span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`py-2 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-sky-50 border border-slate-200/80'
            }`}
          >
            {cat === 'all' ? 'جميع الجوائز' : cat}
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards.map((reward) => {
          const canAfford = currentUser.points >= reward.points;
          return (
            <div
              key={reward.id}
              className="bg-white rounded-2xl p-5 border border-sky-100/90 shadow-[0_4px_20px_-4px_rgba(15,40,71,0.06)] hover:shadow-lg hover:border-sky-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-xs">
                    {getRewardIcon(reward.category, reward.icon)}
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-sm border border-amber-200/70">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span>{reward.points} ⭐</span>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  {reward.category || 'عام'}
                </span>
                <h3 className="font-bold text-base text-[#0F2847] leading-snug mb-2">
                  {reward.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {reward.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedRewardToClaim(reward)}
                  disabled={!canAfford}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    canAfford
                      ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm shadow-sky-600/20 active:scale-98'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>{canAfford ? 'استبدال الجائزة الآن' : `تحتاج ${reward.points - currentUser.points} نقطة إضافية`}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* User Claims History */}
      {myClaims.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-sky-100 shadow-xs mt-8">
          <h3 className="font-bold text-base text-[#0F2847] mb-3">
            سجل طلبات استبدال جوائزي ({myClaims.length})
          </h3>
          <div className="space-y-2">
            {myClaims.map((claim) => (
              <div
                key={claim.id}
                className="p-3 bg-sky-50/40 rounded-xl border border-sky-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-[#0F2847]">{claim.rewardTitle}</span>
                  <span className="text-slate-400 mr-2">(-{claim.pointsSpent} ⭐)</span>
                </div>
                <div>
                  {claim.status === 'delivered' ? (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      تم التسليم واستلام الجائزة ✓
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      قيد التجهيز والتسليم ⏳
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedRewardToClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Gift className="w-8 h-8" />
            </div>
            <h3 className="text-base font-black text-[#0F2847] mb-2">
              تأكيد استبدال الجائزة
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              هل أنت متأكد من استبدال <strong>«{selectedRewardToClaim.title}»</strong> مقابل{' '}
              <strong className="text-amber-600">{selectedRewardToClaim.points} نقطة ⭐</strong>؟
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleClaim}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                {isProcessing ? 'جارِ المعالجة...' : 'نعم، استبدل الآن'}
              </button>
              <button
                onClick={() => setSelectedRewardToClaim(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
