import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Upload, ArrowLeft, CheckCircle, MessageCircle } from 'lucide-react';

const paymentMethods = [
  { id: 'jazzcash', label: 'JazzCash', number: '0304-9237379' },
  { id: 'sadapay', label: 'SadaPay', number: '0304-9237379' },
];

export default function UpgradePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { brand } = useApp();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selectedMethod, setSelectedMethod] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const [form, setForm] = useState({
    name: brand.businessName || '',
    email: user?.email || '',
    paymentMethod: '',
    transactionId: '',
    amount: 'Rs. 4,999',
    message: '',
  });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const copyNumber = (id: string, number: string) => {
    navigator.clipboard.writeText(number.replace(/-/g, ''));
    setCopiedId(id);
    toast({ title: 'Copied ✓' });
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!form.paymentMethod || !form.transactionId) {
      toast({ title: 'Please fill in payment method and transaction ID', variant: 'destructive' });
      return;
    }
    if (!user) return;

    setSubmitting(true);

    try {
      let screenshotUrl = '';

      // Upload screenshot if provided
      if (screenshotFile) {
        const ext = screenshotFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('upgrade-screenshots')
          .upload(path, screenshotFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('upgrade-screenshots')
          .getPublicUrl(path);
        screenshotUrl = urlData.publicUrl;
      }

      // Insert upgrade request
      const { error: insertError } = await supabase.from('upgrade_requests' as any).insert({
        user_id: user.id,
        user_email: form.email,
        transaction_id: form.transactionId,
        payment_method: form.paymentMethod,
        screenshot_url: screenshotUrl,
        notes: form.message,
      } as any);

      if (insertError) throw insertError;

      // Update profile upgrade_requested
      await supabase.from('profiles').update({ upgrade_requested: true } as any).eq('user_id', user.id);

      // ADMIN ACTIVATION INSTRUCTIONS:
      // 1. Go to Lovable Cloud → Backend → Table Editor → upgrade_requests
      // 2. Find the pending request (status = 'pending')
      // 3. Verify transaction ID matches the screenshot
      // 4. If valid:
      //    a. Update upgrade_requests: set status = 'approved'
      //    b. Go to profiles table, find user by email
      //    c. Set plan = 'pro'
      //    d. Set pro_expires_at = 30 days from today
      //    e. Set invoice_count = 0 (reset)
      //    f. Set upgrade_requested = false
      // 5. Send activation confirmation to user via WhatsApp: 0304-9237379

      setSubmitted(true);
    } catch (err: any) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="animate-fade-up flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} strokeWidth={1.5} className="text-sage" />
            </div>
            <h1 className="font-heading text-3xl font-bold mb-3">Request Submitted! 🎉</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              We've received your payment details. Your Pro account will be activated within 2 hours.
              We'll notify you at <span className="font-medium text-foreground">{form.email}</span> when it's ready.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="animate-fade-up pb-20 md:pb-0">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={18} strokeWidth={1.5} />
          </button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Upgrade to Pro</h1>
            <p className="font-body text-sm text-muted-foreground mt-1">Unlimited invoices, clients, and custom branding</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[40%_60%] gap-8">
          {/* Left — Payment Instructions */}
          <div className="space-y-6">
            <h2 className="font-heading text-2xl font-bold">Send Payment</h2>

            {/* Step 1 */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">01</div>
                <h3 className="font-heading text-lg font-bold">Choose & Pay</h3>
              </div>
              <div className="space-y-3">
                {paymentMethods.map(pm => (
                  <div
                    key={pm.id}
                    onClick={() => {
                      setSelectedMethod(pm.id);
                      setForm(f => ({ ...f, paymentMethod: pm.id }));
                    }}
                    className={`border rounded-xl p-4 cursor-pointer transition-all ${
                      selectedMethod === pm.id ? 'border-sage bg-sage-light/30' : 'border-border hover:border-sage/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-body text-sm font-medium">{pm.label}</div>
                        <div className="font-mono text-lg font-bold mt-1">{pm.number}</div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); copyNumber(pm.id, pm.number); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-body hover:bg-muted transition-colors"
                      >
                        {copiedId === pm.id ? <><Check size={12} /> Copied ✓</> : <><Copy size={12} /> Tap to copy</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">02</div>
                <h3 className="font-heading text-lg font-bold">Fill the form</h3>
              </div>
              <p className="font-body text-xs text-muted-foreground ml-11">After sending payment, fill in your details so we can verify</p>
            </div>

            {/* Step 3 */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center font-mono text-xs font-bold">03</div>
                <h3 className="font-heading text-lg font-bold">Wait for activation</h3>
              </div>
              <p className="font-body text-xs text-muted-foreground ml-11">We verify manually and activate your Pro within 2 hours ⚡</p>
            </div>

            <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
              <MessageCircle size={14} strokeWidth={1.5} />
              Need help? WhatsApp us: 0304-9237379
            </div>
          </div>

          {/* Right — Verification Form */}
          <div className="bg-card border border-border rounded-2xl p-6 lg:p-8 h-fit">
            <h2 className="font-heading text-2xl font-bold mb-6">Confirm Your Payment</h2>
            <div className="space-y-5">
              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Your Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Ahmed Khan"
                  className="w-full bg-transparent border-b border-border py-2.5 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Your Email</label>
                <input
                  value={form.email}
                  readOnly
                  className="w-full bg-transparent border-b border-border py-2.5 font-body text-sm outline-none text-muted-foreground"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Payment Method</label>
                <select
                  value={form.paymentMethod}
                  onChange={e => { setForm(f => ({ ...f, paymentMethod: e.target.value })); setSelectedMethod(e.target.value); }}
                  className="w-full bg-transparent border-b border-border py-2.5 font-body text-sm outline-none focus:border-sage"
                >
                  <option value="">Select payment method...</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="sadapay">SadaPay</option>
                </select>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Transaction ID / Reference Number</label>
                <input
                  value={form.transactionId}
                  onChange={e => setForm(f => ({ ...f, transactionId: e.target.value }))}
                  placeholder="e.g. TXN123456789"
                  className="w-full bg-transparent border-b border-border py-2.5 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Amount Paid</label>
                <input
                  value={form.amount}
                  readOnly
                  className="w-full bg-transparent border-b border-border py-2.5 font-mono text-sm outline-none text-muted-foreground"
                />
              </div>

              {/* Screenshot Upload */}
              <div>
                <label className="font-body text-xs text-muted-foreground mb-2 block">Payment Screenshot</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-sage transition-colors group"
                >
                  {screenshotPreview ? (
                    <div className="relative">
                      <img src={screenshotPreview} alt="Screenshot" className="max-h-40 mx-auto rounded-lg" />
                      <p className="font-body text-xs text-muted-foreground mt-2">Click to change</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={24} strokeWidth={1.5} className="mx-auto text-muted-foreground/50 mb-2" />
                      <p className="font-body text-sm text-muted-foreground">Upload payment screenshot</p>
                      <p className="font-body text-xs text-muted-foreground/50 mt-1">JPG, PNG — max 5MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png" onChange={handleScreenshot} className="hidden" />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Message (optional)</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Any notes for us?"
                  rows={3}
                  className="w-full bg-transparent border-b border-border py-2.5 font-body text-sm outline-none focus:border-sage resize-none transition-colors placeholder:text-muted-foreground/50"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-foreground text-primary-foreground py-3.5 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'SUBMIT FOR VERIFICATION'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
