import { useState, useRef, useCallback } from 'react';
import AppShell from '@/components/AppShell';
import { useApp } from '@/context/AppContext';
import { Upload, Palette, Type, Building2, CreditCard, FileText, Trash2, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const businessTypes = ['Retail Shop', 'Freelancer', 'Agency', 'Restaurant', 'Boutique', 'Other'];
const colorSwatches = ['#1C1917', '#7C9A7E', '#C0784A', '#4A7C9A', '#9A4A7C', '#7C4A9A', '#9A7C4A', '#4A9A7C'];
const fontStyles = [
  { key: 'Classic', font: 'font-heading', label: 'Cormorant' },
  { key: 'Modern', font: 'font-body', label: 'Jost' },
  { key: 'Bold', font: 'font-display', label: 'Syne' },
  { key: 'Mono', font: 'font-mono', label: 'DM Mono' },
];
const paymentOptions = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30'];

export default function Settings() {
  const { brand, setBrand } = useApp();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...brand });
  const [activeTab, setActiveTab] = useState<'brand' | 'invoice' | 'payment'>('brand');

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => update('logo', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const save = () => {
    setBrand(form);
    toast({ title: 'Settings saved ✓' });
  };

  const fontClass = (style: string) => {
    const map: Record<string, string> = { Classic: 'font-heading', Modern: 'font-body', Bold: 'font-display', Mono: 'font-mono' };
    return map[style] || 'font-heading';
  };

  const tabs = [
    { key: 'brand' as const, label: 'Brand Identity', icon: Palette },
    { key: 'invoice' as const, label: 'Invoice Defaults', icon: FileText },
    { key: 'payment' as const, label: 'Payment Details', icon: CreditCard },
  ];

  return (
    <AppShell>
      <div className="animate-fade-up pb-20 md:pb-0">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">Settings</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Manage your brand, invoice defaults, and payment info</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-body transition-all ${
                activeTab === t.key
                  ? 'bg-foreground text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground'
              }`}>
              <t.icon size={15} strokeWidth={1.5} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Brand Identity Tab */}
        {activeTab === 'brand' && (
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 animate-fade-up">
            <div className="space-y-6">
              {/* Business Info */}
              <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Building2 size={18} strokeWidth={1.5} className="text-sage" />
                  <h2 className="font-heading text-xl font-bold">Business Information</h2>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Business Name</label>
                  <input value={form.businessName || ''} onChange={e => update('businessName', e.target.value)}
                    placeholder="e.g. Ahmed & Sons Trading"
                    className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-2 block">Business Type</label>
                  <div className="flex flex-wrap gap-2">
                    {businessTypes.map(t => (
                      <button key={t} onClick={() => update('businessType', t)}
                        className={`px-4 py-2 rounded-full text-sm font-body border transition-all ${
                          form.businessType === t
                            ? 'bg-foreground text-primary-foreground border-foreground'
                            : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                        }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">City</label>
                    <input value={form.city || ''} onChange={e => update('city', e.target.value)}
                      placeholder="e.g. Karachi"
                      className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                  </div>
                  <div>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">Phone</label>
                    <input value={form.phone || ''} onChange={e => update('phone', e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                  </div>
                </div>
              </section>

              {/* Logo Upload */}
              <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Upload size={18} strokeWidth={1.5} className="text-sage" />
                    <h2 className="font-heading text-xl font-bold">Logo</h2>
                  </div>
                  {form.logo && (
                    <button onClick={() => update('logo', null)} className="text-xs text-muted-foreground hover:text-destructive font-body flex items-center gap-1 transition-colors">
                      <Trash2 size={12} strokeWidth={1.5} /> Remove
                    </button>
                  )}
                </div>
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 text-center cursor-pointer hover:border-sage transition-colors group">
                  {form.logo ? (
                    <div className="relative">
                      <img src={form.logo} alt="Logo" className="max-h-20 mx-auto" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 rounded-xl">
                        <span className="flex items-center gap-1 text-sm font-body text-sage"><Pencil size={14} strokeWidth={1.5} /> Change</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} strokeWidth={1.5} className="mx-auto text-muted-foreground/50 mb-2" />
                      <p className="font-body text-sm text-muted-foreground">Drop your logo here or click to upload</p>
                      <p className="font-body text-xs text-muted-foreground/50 mt-1">PNG, JPG, SVG — max 2MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </section>

              {/* Brand Color & Font */}
              <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-2">
                  <Palette size={18} strokeWidth={1.5} className="text-sage" />
                  <h2 className="font-heading text-xl font-bold">Brand Style</h2>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-3 block">Brand Color</label>
                  <div className="flex flex-wrap gap-3">
                    {colorSwatches.map(c => (
                      <button key={c} onClick={() => update('brandColor', c)}
                        className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                          form.brandColor === c ? 'border-foreground scale-110 shadow-md' : 'border-transparent hover:scale-105'
                        }`}
                        style={{ backgroundColor: c }}>
                        {form.brandColor === c && (
                          <span className="absolute inset-0 flex items-center justify-center text-primary-foreground text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-3 block">Font Style</label>
                  <div className="grid grid-cols-2 gap-3">
                    {fontStyles.map(f => (
                      <button key={f.key} onClick={() => update('fontStyle', f.key)}
                        className={`px-4 py-3 rounded-xl text-left border transition-all ${
                          form.fontStyle === f.key
                            ? 'bg-foreground text-primary-foreground border-foreground'
                            : 'border-border text-foreground hover:border-foreground'
                        }`}>
                        <span className={`text-lg ${f.font} block`}>{f.key}</span>
                        <span className={`text-xs opacity-70 ${form.fontStyle === f.key ? '' : 'text-muted-foreground'}`}>{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Live Brand Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-20 space-y-4">
                <div className="text-xs font-body text-muted-foreground flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse" /> Live Preview
                </div>
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                  <div className="border-b pb-4 mb-4" style={{ borderColor: form.brandColor || '#1C1917' }}>
                    <div className="flex items-center gap-3 mb-2">
                      {form.logo && <img src={form.logo} alt="Logo" className="h-8" />}
                      <div>
                        <div className={`text-xl font-bold ${fontClass(form.fontStyle)}`} style={{ color: form.brandColor || '#1C1917' }}>
                          {form.businessName || 'Your Business Name'}
                        </div>
                        <div className="text-xs text-muted-foreground font-body">
                          {form.businessType && <span>{form.businessType} • </span>}
                          {form.city || 'City'} • {form.phone || '+92 XXX XXXXXXX'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`text-2xl font-bold mb-1 ${fontClass(form.fontStyle)}`}>INVOICE</div>
                  <div className="flex justify-between text-xs font-body text-muted-foreground mb-5">
                    <span>{form.invoicePrefix || 'INV'}-001</span>
                    <span>March 8, 2026</span>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-muted-foreground font-body mb-1">Bill To</div>
                    <div className={`text-sm font-medium ${fontClass(form.fontStyle)}`}>Ahmed Trading Co.</div>
                    <div className="text-xs text-muted-foreground font-body">Karachi, Pakistan</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-body text-muted-foreground border-b border-border pb-1">
                      <span>Description</span><span>Amount</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span>Design Services</span><span className="font-mono">Rs. 35,000</span>
                    </div>
                    <div className="flex justify-between text-sm font-body">
                      <span>Development</span><span className="font-mono">Rs. 50,000</span>
                    </div>
                  </div>

                  <div className="border-t pt-3 space-y-1 text-right" style={{ borderColor: form.brandColor || '#1C1917' }}>
                    <div className="flex justify-end gap-4 text-xs font-body">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-mono">Rs. 85,000</span>
                    </div>
                    {form.taxRate > 0 && (
                      <div className="flex justify-end gap-4 text-xs font-body">
                        <span className="text-muted-foreground">Tax ({form.taxRate}%)</span>
                        <span className="font-mono">Rs. {Math.round(85000 * form.taxRate / 100).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-end gap-4 pt-2 border-t border-border">
                      <span className="font-body font-medium text-sm">Total</span>
                      <span className="font-mono text-lg font-bold" style={{ color: form.brandColor || '#1C1917' }}>
                        Rs. {Math.round(85000 * (1 + form.taxRate / 100)).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <div className="text-[10px] text-muted-foreground/40 font-body">Generated by BillBook • billbook.pk</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Defaults Tab */}
        {activeTab === 'invoice' && (
          <div className="max-w-xl space-y-6 animate-fade-up">
            <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <FileText size={18} strokeWidth={1.5} className="text-sage" />
                <h2 className="font-heading text-xl font-bold">Invoice Configuration</h2>
              </div>

              <div className="flex items-center gap-3 bg-sage-light rounded-xl px-4 py-3">
                <span className="text-lg">🇵🇰</span>
                <div>
                  <div className="font-body text-sm font-medium">Pakistani Rupee (PKR)</div>
                  <div className="font-body text-xs text-muted-foreground">Default currency</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Invoice Prefix</label>
                  <input value={form.invoicePrefix || ''} onChange={e => update('invoicePrefix', e.target.value)}
                    placeholder="e.g. INV or BB"
                    className="w-full bg-transparent border-b border-border py-3 font-mono text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                  <p className="text-[10px] text-muted-foreground/60 font-body mt-1">Shown as "{form.invoicePrefix || 'INV'}-001"</p>
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Next Invoice Number</label>
                  <input type="number" value={form.nextInvoiceNumber || 1} onChange={e => update('nextInvoiceNumber', Number(e.target.value))}
                    className="w-full bg-transparent border-b border-border py-3 font-mono text-sm outline-none focus:border-sage transition-colors" />
                </div>
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Default Tax Rate (%)</label>
                <input type="number" value={form.taxRate || 0} onChange={e => update('taxRate', Number(e.target.value))}
                  placeholder="e.g. 17 for GST"
                  className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
              </div>

              <div>
                <label className="font-body text-xs text-muted-foreground mb-1 block">Default Payment Terms</label>
                <select value={form.paymentTerms || 'Net 30'} onChange={e => update('paymentTerms', e.target.value)}
                  className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors">
                  {paymentOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </section>
          </div>
        )}

        {/* Payment Details Tab */}
        {activeTab === 'payment' && (
          <div className="max-w-xl space-y-6 animate-fade-up">
            <section className="bg-card border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <CreditCard size={18} strokeWidth={1.5} className="text-sage" />
                <h2 className="font-heading text-xl font-bold">Bank Account</h2>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <label className="font-body text-sm">I prefer cash / JazzCash / Easypaisa</label>
                <button onClick={() => update('preferCash', !form.preferCash)}
                  className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${form.preferCash ? 'bg-sage justify-end' : 'bg-border justify-start'}`}>
                  <div className="w-5 h-5 bg-card rounded-full shadow-sm transition-transform" />
                </button>
              </div>

              {form.preferCash ? (
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Payment Instructions</label>
                  <textarea value={form.cashInstructions || ''} onChange={e => update('cashInstructions', e.target.value)}
                    placeholder="e.g. JazzCash: 0300-1234567 (Muhammad Ahmed)"
                    rows={3}
                    className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors resize-none placeholder:text-muted-foreground/50" />
                </div>
              ) : (
                <>
                  {[
                    { key: 'bankName', label: 'Bank Name', placeholder: 'e.g. HBL, UBL, Meezan Bank' },
                    { key: 'accountTitle', label: 'Account Title', placeholder: 'e.g. Muhammad Ahmed' },
                    { key: 'accountNumber', label: 'Account Number', placeholder: 'Account number' },
                    { key: 'iban', label: 'IBAN (optional)', placeholder: 'PK00XXXX0000000000000000' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="font-body text-xs text-muted-foreground mb-1 block">{f.label}</label>
                      <input value={(form as any)[f.key] || ''} onChange={e => update(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-transparent border-b border-border py-3 font-body text-sm outline-none focus:border-sage transition-colors placeholder:text-muted-foreground/50" />
                    </div>
                  ))}
                </>
              )}
            </section>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 flex items-center gap-4">
          <button onClick={save} className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity">
            Save All Changes
          </button>
          <span className="font-body text-xs text-muted-foreground">Changes apply to all new invoices</span>
        </div>
      </div>
    </AppShell>
  );
}
