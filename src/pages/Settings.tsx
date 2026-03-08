import { useState, useRef } from 'react';
import AppShell from '@/components/AppShell';
import { useApp } from '@/context/AppContext';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const colorSwatches = ['#1C1917', '#7C9A7E', '#C0784A', '#4A7C9A', '#9A4A7C', '#7C4A9A', '#9A7C4A', '#4A9A7C'];
const fontStyles = ['Classic', 'Modern', 'Bold', 'Mono'];
const paymentOptions = ['Due on Receipt', 'Net 7', 'Net 15', 'Net 30'];

export default function Settings() {
  const { brand, setBrand } = useApp();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ ...brand });

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

  return (
    <AppShell>
      <div className="animate-fade-up space-y-8 max-w-2xl pb-20 md:pb-0">
        <h1 className="font-heading text-3xl font-bold">Settings</h1>

        {/* Business Info */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold">Business Info</h2>
          {[
            { key: 'businessName', label: 'Business Name' },
            { key: 'city', label: 'City' },
            { key: 'phone', label: 'Phone' },
          ].map(f => (
            <div key={f.key}>
              <label className="font-body text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={(form as any)[f.key] || ''} onChange={e => update(f.key, e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage" />
            </div>
          ))}
          <div>
            <label className="font-body text-xs text-muted-foreground mb-2 block">Logo</label>
            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-border rounded-2xl p-6 text-center cursor-pointer hover:border-sage transition-colors">
              {form.logo ? <img src={form.logo} alt="Logo" className="max-h-16 mx-auto" /> : (
                <><Upload size={20} strokeWidth={1.5} className="mx-auto text-muted-foreground mb-1" /><p className="font-body text-xs text-muted-foreground">Upload logo</p></>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} className="hidden" />
          </div>
        </section>

        {/* Branding */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold">Branding</h2>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-2 block">Brand Color</label>
            <div className="flex flex-wrap gap-3">
              {colorSwatches.map(c => (
                <button key={c} onClick={() => update('brandColor', c)}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${form.brandColor === c ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-2 block">Font Style</label>
            <div className="flex flex-wrap gap-2">
              {fontStyles.map(f => (
                <button key={f} onClick={() => update('fontStyle', f)}
                  className={`px-4 py-2 rounded-full text-sm font-body border transition-all ${form.fontStyle === f ? 'bg-foreground text-primary-foreground border-foreground' : 'border-border text-muted-foreground hover:border-foreground'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Invoice Defaults */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold">Invoice Defaults</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Prefix</label>
              <input value={form.invoicePrefix || ''} onChange={e => update('invoicePrefix', e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm outline-none focus:border-sage" />
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground mb-1 block">Next #</label>
              <input type="number" value={form.nextInvoiceNumber || 1} onChange={e => update('nextInvoiceNumber', Number(e.target.value))}
                className="w-full bg-transparent border-b border-border py-2 font-mono text-sm outline-none focus:border-sage" />
            </div>
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">Default Tax %</label>
            <input type="number" value={form.taxRate || 0} onChange={e => update('taxRate', Number(e.target.value))}
              className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage" />
          </div>
          <div>
            <label className="font-body text-xs text-muted-foreground mb-1 block">Payment Terms</label>
            <select value={form.paymentTerms || 'Net 30'} onChange={e => update('paymentTerms', e.target.value)}
              className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage">
              {paymentOptions.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </section>

        {/* Bank Details */}
        <section className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <h2 className="font-heading text-xl font-bold">Payment Details</h2>
          {[
            { key: 'bankName', label: 'Bank Name' },
            { key: 'accountTitle', label: 'Account Title' },
            { key: 'accountNumber', label: 'Account Number' },
            { key: 'iban', label: 'IBAN (optional)' },
          ].map(f => (
            <div key={f.key}>
              <label className="font-body text-xs text-muted-foreground mb-1 block">{f.label}</label>
              <input value={(form as any)[f.key] || ''} onChange={e => update(f.key, e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage" />
            </div>
          ))}
        </section>

        <button onClick={save} className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity">
          Save Settings
        </button>
      </div>
    </AppShell>
  );
}
