import { useNavigate } from 'react-router-dom';
import { X, Check, Minus } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const freeFeatures = [
  { text: '5 invoices/mo', included: true },
  { text: 'PDF export', included: true },
  { text: '3 clients', included: true },
  { text: 'Custom branding', included: false },
  { text: 'Priority support', included: false },
];

const proFeatures = [
  { text: 'Unlimited invoices', included: true },
  { text: 'PDF export', included: true },
  { text: 'Unlimited clients', included: true },
  { text: 'Custom branding', included: true },
  { text: 'Priority support', included: true },
];

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card rounded-3xl border border-border p-8 w-full max-w-[520px] mx-4 animate-fade-up shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        <h2 className="font-heading text-2xl font-bold text-center mb-6">Choose Your Plan</h2>

        {/* Plan comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Free */}
          <div className="border border-border rounded-2xl p-5">
            <div className="font-heading text-lg font-bold mb-1">FREE</div>
            <div className="font-mono text-sm text-muted-foreground mb-4">Rs. 0/month</div>
            <div className="space-y-2.5">
              {freeFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-body">
                  {f.included ? (
                    <Check size={14} strokeWidth={1.5} className="text-sage shrink-0" />
                  ) : (
                    <Minus size={14} strokeWidth={1.5} className="text-muted-foreground/40 shrink-0" />
                  )}
                  <span className={f.included ? 'text-muted-foreground' : 'text-muted-foreground/40'}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div className="border-2 border-sage rounded-2xl p-5 bg-sage-light/30 relative">
            <div className="absolute -top-2.5 right-4 bg-sage text-primary-foreground text-[10px] font-body font-medium px-3 py-0.5 rounded-full">
              RECOMMENDED
            </div>
            <div className="font-heading text-lg font-bold mb-1">PRO</div>
            <div className="font-mono text-sm mb-4">Rs. 4,999/month</div>
            <div className="space-y-2.5">
              {proFeatures.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-body">
                  <Check size={14} strokeWidth={1.5} className="text-sage shrink-0" />
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => { onClose(); navigate('/upgrade'); }}
          className="w-full bg-foreground text-primary-foreground py-3.5 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
        >
          UPGRADE TO PRO — Rs. 4,999/mo
        </button>
        <p className="text-center font-body text-[11px] text-muted-foreground mt-3">
          One-time manual verification • Activates within 2 hours
        </p>
      </div>
    </div>
  );
}
