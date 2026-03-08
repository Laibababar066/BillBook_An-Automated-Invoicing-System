import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';
import { getUserPlan, type UserPlan } from '@/lib/plan-utils';

interface SidebarUpgradeCardProps {
  userPlan: UserPlan;
  onUpgradeClick: () => void;
}

export default function SidebarUpgradeCard({ userPlan, onUpgradeClick }: SidebarUpgradeCardProps) {
  const plan = getUserPlan(userPlan);
  if (plan === 'pro') return null;

  const used = userPlan.invoiceCount;
  const total = 5;
  const percentage = Math.min((used / total) * 100, 100);

  return (
    <div className="bg-sage-light rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Crown size={16} strokeWidth={1.5} className="text-sage" />
        <span className="text-xs font-body font-medium text-foreground">Free Plan</span>
      </div>
      <p className="text-xs text-muted-foreground font-body mb-2">{used}/{total} invoices used</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-border rounded-full mb-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: percentage >= 100 ? 'hsl(var(--destructive))' : percentage >= 80 ? '#D97706' : 'hsl(var(--sage))',
          }}
        />
      </div>

      <button
        onClick={onUpgradeClick}
        className="w-full bg-foreground text-primary-foreground text-xs py-2 rounded-full font-body font-medium hover:opacity-90 transition-opacity"
      >
        Upgrade to Pro
      </button>
    </div>
  );
}
