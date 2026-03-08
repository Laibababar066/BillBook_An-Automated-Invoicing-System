import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillBookLogo } from '@/components/BillBookLogo';
import { useApp } from '@/context/AppContext';
import { Upload, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const businessTypes = ['Retail Shop', 'Freelancer', 'Agency', 'Restaurant', 'Boutique', 'Other'];
const colorSwatches = ['#1C1917', '#7C9A7E', '#C0784A', '#4A7C9A', '#9A4A7C', '#7C4A9A', '#9A7C4A', '#4A9A7C'];
const fontStyles = ['Classic', 'Modern', 'Bold', 'Mono'];
const paymentOptions = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30'];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const { brand, setBrand } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    businessName: brand.businessName || '',
    businessType: brand.businessType || '',
    city: brand.city || '',
    phone: brand.phone || '',
    logo: brand.logo || null as string | null,
    brandColor: brand.brandColor || '#1C1917',
    fontStyle: brand.fontStyle || 'Classic',
    taxRate: brand.taxRate || 17,
    paymentTerms: brand.paymentTerms || 'Net 30',
    invoicePrefix: brand.invoicePrefix || 'INV',
    nextInvoiceNumber: brand.nextInvoiceNumber || 1,
    bankName: brand.bankName || '',
    accountTitle: brand.accountTitle || '',
    accountNumber: brand.accountNumber || '',
    iban: brand.iban || '',
    preferCash: brand.preferCash || false,
    cashInstructions: brand.cashInstructions || '',
  });

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => update('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const finish = () => {
    setBrand({ ...form, currency: 'PKR', onboardingComplete: true });
    toast({ title: 'Welcome to BillBook! ✓', description: 'Your brand is set up and ready to go.' });
    navigate('/dashboard');
  };

  const fontClass = (style: string) => {
    const map: Record<string, string> = { Classic: 'font-heading', Modern: 'font-body', Bold: 'font-display', Mono: 'font-mono' };
    return map[style] || 'font-heading';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex w-[40%] relative overflow-hidden flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, hsl(30,33%,97%) 0%, hsl(25,48%,85%) 50%, hsl(120,28%,94%) 100%)' }}>
        <BillBookLogo size="lg" />
        <div>
          <p className="font-heading text-2xl italic text-foreground/80 leading-relaxed">
            "Your business deserves invoices as professional as your work."
          </p>
        </div>
        <div />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col p-6 md:p-10 lg:p-16 overflow-y-auto">
        <div className="lg:hidden mb-8"><BillBookLogo /></div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm text-muted-foreground">Step {step} of 4</span>
            <div className="flex gap-1.5">
              {[1,2,3,4].map(s => (
                <div key={s} className={`w-2 h-2 rounded-full transition-all ${s <= step ? 'bg-sage' : 'bg-border'}`} />
              ))}
            </div>
          </div>
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: `${(step/4)*100}%` }} />
          </div>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className="animate-fade-up space-y-6 max-w-lg">
            <h2 className="font-heading text-3xl font-bold">Tell us about your business</h2>
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1 block">Business Name</label>
              <input value={form.businessName} onChange={e => update('businessName', e.target.value)}
                placeholder="e.g. Ahmed & Sons Trading"
                className="w-full bg-transparent border-b border-border py-3 font-body text-foreground outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <label className="font-body text-sm text-muted-foreground mb-2 block">Business Type</label>
              <div className="flex flex-wrap gap-2">
                {businessTypes.map(t => (
                  <button key={t} onClick={() => update('businessType', t)}
                    className={`px-4 py-2 rounded-full text-sm font-body border transition-all ${form.businessType === t ? 'bg-foreground text-primary-foreground border-foreground' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1 block">City</label>
              <input value={form.city} onChange={e => update('city', e.target.value)}
                placeholder="e.g. Karachi, Lahore, Islamabad"
                className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1 block">Phone</label>
              <input value={form.phone} onChange={e => update('phone', e.target.value)}
                placeholder="+92 300 0000000"
                className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="animate-fade-up max-w-2xl">
            <h2 className="font-heading text-3xl font-bold mb-6">Make it yours</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 block">Logo Upload</label>
                  <div onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-sage transition-colors">
                    {form.logo ? (
                      <img src={form.logo} alt="Logo" className="max-h-20 mx-auto" />
                    ) : (
                      <>
                        <Upload size={24} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-2" />
                        <p className="font-body text-sm text-muted-foreground">Drop your logo here or click to upload</p>
                        <p className="font-body text-xs text-muted-foreground/60 mt-1">PNG, JPG, SVG</p>
                      </>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 block">Brand Color</label>
                  <div className="flex flex-wrap gap-3">
                    {colorSwatches.map(c => (
                      <button key={c} onClick={() => update('brandColor', c)}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${form.brandColor === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-2 block">Font Style</label>
                  <div className="flex flex-wrap gap-2">
                    {fontStyles.map(f => (
                      <button key={f} onClick={() => update('fontStyle', f)}
                        className={`px-4 py-2 rounded-full text-sm border transition-all ${form.fontStyle === f ? 'bg-foreground text-primary-foreground border-foreground' : 'border-border text-muted-foreground hover:border-foreground'} ${fontClass(f)}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Mini preview */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="text-xs text-muted-foreground font-body mb-3">Live Preview</div>
                <div className="border-b pb-3 mb-3" style={{ borderColor: form.brandColor }}>
                  <div className={`text-lg font-bold ${fontClass(form.fontStyle)}`} style={{ color: form.brandColor }}>
                    {form.businessName || 'Your Business'}
                  </div>
                  <div className="text-xs text-muted-foreground font-body">{form.city || 'City'}</div>
                </div>
                <div className={`text-xl font-bold mb-2 ${fontClass(form.fontStyle)}`}>INVOICE</div>
                <div className="flex justify-between text-xs font-body text-muted-foreground mb-4">
                  <span>INV-001</span><span>March 2026</span>
                </div>
                <div className="space-y-1 text-sm font-body">
                  <div className="flex justify-between"><span>Design Services</span><span className="font-mono">Rs. 25,000</span></div>
                  <div className="border-t border-border pt-1 flex justify-between font-medium">
                    <span>Total</span><span className="font-mono" style={{ color: form.brandColor }}>Rs. 25,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="animate-fade-up space-y-6 max-w-lg">
            <h2 className="font-heading text-3xl font-bold">Set your defaults</h2>
            <div className="flex items-center gap-3 bg-sage-light rounded-xl px-4 py-3">
              <span className="text-lg">🇵🇰</span>
              <div>
                <div className="font-body text-sm font-medium">Pakistani Rupee (PKR)</div>
                <div className="font-body text-xs text-muted-foreground">Default currency</div>
              </div>
            </div>
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1 block">Default Tax %</label>
              <input type="number" value={form.taxRate} onChange={e => update('taxRate', Number(e.target.value))}
                placeholder="e.g. 17 for GST"
                className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
            </div>
            <div>
              <label className="font-body text-sm text-muted-foreground mb-1 block">Default Payment Terms</label>
              <select value={form.paymentTerms} onChange={e => update('paymentTerms', e.target.value)}
                className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors">
                {paymentOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">Invoice Prefix</label>
                <input value={form.invoicePrefix} onChange={e => update('invoicePrefix', e.target.value)}
                  placeholder="e.g. INV or BB"
                  className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
              </div>
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">Next Invoice #</label>
                <input type="number" value={form.nextInvoiceNumber} onChange={e => update('nextInvoiceNumber', Number(e.target.value))}
                  className="w-full bg-transparent border-b border-border py-3 font-mono outline-none focus:border-sage transition-colors" />
              </div>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="animate-fade-up space-y-6 max-w-lg">
            <h2 className="font-heading text-3xl font-bold">Where should clients pay?</h2>
            <div className="flex items-center gap-3 mb-2">
              <label className="font-body text-sm">I prefer cash / JazzCash / Easypaisa</label>
              <button onClick={() => update('preferCash', !form.preferCash)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.preferCash ? 'bg-sage justify-end' : 'bg-border justify-start'}`}>
                <div className="w-5 h-5 bg-card rounded-full shadow-sm transition-transform" />
              </button>
            </div>
            {form.preferCash ? (
              <div>
                <label className="font-body text-sm text-muted-foreground mb-1 block">Payment Instructions</label>
                <textarea value={form.cashInstructions} onChange={e => update('cashInstructions', e.target.value)}
                  placeholder="e.g. JazzCash: 0300-1234567 (Muhammad Ahmed)"
                  rows={3}
                  className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50 resize-none" />
              </div>
            ) : (
              <>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">Bank Name</label>
                  <input value={form.bankName} onChange={e => update('bankName', e.target.value)}
                    placeholder="e.g. HBL, UBL, Meezan Bank"
                    className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">Account Title</label>
                  <input value={form.accountTitle} onChange={e => update('accountTitle', e.target.value)}
                    className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">Account Number</label>
                  <input value={form.accountNumber} onChange={e => update('accountNumber', e.target.value)}
                    className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="font-body text-sm text-muted-foreground mb-1 block">IBAN (optional)</label>
                  <input value={form.iban} onChange={e => update('iban', e.target.value)}
                    className="w-full bg-transparent border-b border-border py-3 font-body outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-10 max-w-lg">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-body text-sm transition-colors">
              <ArrowLeft size={16} strokeWidth={1.5} /> Back
            </button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              Next <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          ) : (
            <button onClick={finish}
              className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
              TAKE ME TO MY DASHBOARD <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
