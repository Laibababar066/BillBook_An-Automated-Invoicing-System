import type { BrandSettings } from '@/context/AppContext';

export interface UserPlan {
  plan: string;
  invoiceCount: number;
  proExpiresAt: string | null;
  upgradeRequested: boolean;
}

export const getUserPlan = (userPlan: UserPlan): 'pro' | 'free' => {
  if (userPlan.plan === 'pro' && userPlan.proExpiresAt) {
    const expiry = new Date(userPlan.proExpiresAt);
    const today = new Date();
    if (expiry > today) return 'pro';
  }
  return 'free';
};

export const getInvoicesRemaining = (userPlan: UserPlan): number => {
  if (getUserPlan(userPlan) === 'pro') return Infinity;
  return Math.max(0, 5 - userPlan.invoiceCount);
};

export const canCreateInvoice = (userPlan: UserPlan): boolean => {
  return getUserPlan(userPlan) === 'pro' || userPlan.invoiceCount < 5;
};

export const getUsageWarning = (userPlan: UserPlan): { message: string; level: 'info' | 'warning' | 'error' } | null => {
  const plan = getUserPlan(userPlan);
  if (plan === 'pro') return null;

  const used = userPlan.invoiceCount;
  if (used >= 5) return { message: '🔒 You\'ve reached your free limit. Upgrade to keep invoicing.', level: 'error' };
  if (used === 4) return { message: '⚠️ Only 1 free invoice left this month.', level: 'warning' };
  if (used >= 3) return { message: `You've used ${used} of 5 free invoices this month. Upgrade to Pro for unlimited.`, level: 'info' };
  return null;
};

export const getProExpiryWarning = (userPlan: UserPlan): string | null => {
  if (userPlan.plan === 'pro' && userPlan.proExpiresAt) {
    const expiry = new Date(userPlan.proExpiresAt);
    const today = new Date();
    if (expiry <= today) {
      return `Your Pro plan expired on ${expiry.toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}. Renew for Rs. 4,999 →`;
    }
  }
  return null;
};
