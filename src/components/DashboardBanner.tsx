import { useNavigate } from 'react-router-dom';
import { getUsageWarning, getProExpiryWarning, type UserPlan } from '@/lib/plan-utils';

interface DashboardBannerProps {
  userPlan: UserPlan;
}

export default function DashboardBanner({ userPlan }: DashboardBannerProps) {
  const navigate = useNavigate();
  const warning = getUsageWarning(userPlan);
  const expiryWarning = getProExpiryWarning(userPlan);

  const message = expiryWarning || warning?.message;
  if (!message) return null;

  const level = expiryWarning ? 'warning' : warning?.level || 'info';

  const borderColor = level === 'error' ? 'border-l-destructive' : level === 'warning' ? 'border-l-[#D97706]' : 'border-l-sage';
  const bgColor = 'bg-card';

  return (
    <div className={`${bgColor} ${borderColor} border border-border border-l-4 rounded-2xl px-5 py-3.5 flex items-center justify-between gap-4 animate-fade-up`}>
      <p className="font-body text-sm text-foreground">{message}</p>
      <button
        onClick={() => navigate('/upgrade')}
        className="shrink-0 text-sage font-body text-sm font-medium hover:text-foreground transition-colors"
      >
        Upgrade Now →
      </button>
    </div>
  );
}
