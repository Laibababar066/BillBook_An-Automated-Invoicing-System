import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useApp, formatPKR, type InvoiceItem } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Plus, X, FileDown, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { canCreateInvoice } from '@/lib/plan-utils';
import UpgradeModal from '@/components/UpgradeModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CreateInvoice() {
  const { brand, clients, invoices, addInvoice, userPlan } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check if user can create invoice
  if (!canCreateInvoice(userPlan)) {
    return (
      <AppShell>
        <div className="animate-fade-up flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="font-heading text-2xl font-bold mb-2">Free Limit Reached</h1>
            <p className="font-body text-sm text-muted-foreground mb-6">
              You've used all 5 free invoices this month. Upgrade to Pro for unlimited invoicing.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade to Pro — Rs. 4,999/mo
            </button>
          </div>
          <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
        </div>
      </AppShell>
    );
  }

  const nextNum = brand.nextInvoiceNumber || invoices.length + 1;
  const invoiceNumber = `${brand.invoicePrefix || 'INV'}-${String(nextNum).padStart(3, '0')}`;

  const [form, setForm] = useState({
    number: invoiceNumber,
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [{ description: '', qty: 1, unitPrice: 0 }] as InvoiceItem[],
    taxRate: brand.taxRate || 0,
    discount: 0,
    notes: brand.preferCash ? brand.cashInstructions : `Bank: ${brand.bankName}\nA/C: ${brand.accountTitle}\nA/C #: ${brand.accountNumber}${brand.iban ? '\nIBAN: ' + brand.iban : ''}`,
  });

  const selectClient = (id: string) => {
    const c = clients.find(cl => cl.id === id);
    if (c) {
      setForm(f => ({ ...f, clientId: id, clientName: c.name, clientEmail: c.email, clientPhone: c.phone, clientAddress: c.address }));
    }
  };

  const updateItem = (idx: number, key: keyof InvoiceItem, value: any) => {
    setForm(f => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...f, items };
    });
  };

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { description: '', qty: 1, unitPrice: 0 }] }));
  const removeItem = (idx: number) => setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + (i.qty * i.unitPrice), 0);
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount - form.discount;

  const saveInvoice = async (status: 'draft' | 'unpaid') => {
    setSaving(true);
    const result = await addInvoice({
      number: form.number,
      clientId: form.clientId,
      clientName: form.clientName || 'Unknown',
      date: form.date,
      dueDate: form.dueDate,
      amount: total,
      status,
      items: form.items,
      notes: form.notes,
    });
    setSaving(false);
    if (result) {
      toast({ title: status === 'draft' ? 'Draft saved ✓' : 'Invoice sent ✓' });
      navigate('/invoices');
    } else {
      toast({ title: 'Failed to save invoice', variant: 'destructive' });
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(brand.businessName || 'BillBook', 14, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${brand.city || ''} | ${brand.phone || ''}`, 14, 32);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('INVOICE', 140, 25);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${form.number}`, 140, 32);
    doc.text(`Date: ${form.date}`, 140, 38);
    doc.text(`Due: ${form.dueDate || 'N/A'}`, 140, 44);
    doc.setDrawColor(200);
    doc.line(14, 50, 196, 50);
    doc.setFontSize(10);
    doc.text('Bill To:', 14, 58);
    doc.setFont('helvetica', 'bold');
    doc.text(form.clientName || 'N/A', 14, 64);
    doc.setFont('helvetica', 'normal');
    doc.text(form.clientEmail || '', 14, 70);
    doc.text(form.clientAddress || '', 14, 76);
    autoTable(doc, {
      startY: 85,
      head: [['Description', 'Qty', 'Unit Price', 'Total']],
      body: form.items.map(i => [i.description, String(i.qty), formatPKR(i.unitPrice), formatPKR(i.qty * i.unitPrice)]),
      theme: 'plain',
      headStyles: { fillColor: [28, 25, 23], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 248, 245] },
    });
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatPKR(subtotal)}`, 140, finalY + 10);
    doc.text(`Tax (${form.taxRate}%): ${formatPKR(taxAmount)}`, 140, finalY + 17);
    if (form.discount > 0) doc.text(`Discount: -${formatPKR(form.discount)}`, 140, finalY + 24);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`Total: ${formatPKR(total)}`, 140, finalY + (form.discount > 0 ? 34 : 27));
    if (form.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const noteY = finalY + 45;
      doc.text('Payment Details:', 14, noteY);
      doc.text(form.notes, 14, noteY + 6);
    }
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Generated by BillBook • billbook.pk', 14, 285);
    doc.save(`${form.number}-${form.clientName || 'invoice'}.pdf`);
    toast({ title: 'PDF downloaded ✓' });
  };

  return (
    <AppShell>
      <div className="animate-fade-up pb-20 md:pb-0">
        <h1 className="font-heading text-3xl font-bold mb-6">Create Invoice</h1>
        <div className="grid lg:grid-cols-[55%_45%] gap-6">
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Invoice #</label>
                  <input value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                    className="w-full bg-transparent border-b border-border py-2 font-mono text-sm outline-none focus:border-sage" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Invoice Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage" />
                </div>
                <div>
                  <label className="font-body text-xs text-muted-foreground mb-1 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                    className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h3 className="font-heading text-lg font-bold">Bill To</h3>
              <select value={form.clientId} onChange={e => selectClient(e.target.value)}
                className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage">
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.city}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} placeholder="Client Name"
                  className="bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage placeholder:text-muted-foreground/50" />
                <input value={form.clientEmail} onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))} placeholder="Email"
                  className="bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage placeholder:text-muted-foreground/50" />
                <input value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} placeholder="Phone"
                  className="bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage placeholder:text-muted-foreground/50" />
                <input value={form.clientAddress} onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))} placeholder="Address"
                  className="bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage placeholder:text-muted-foreground/50" />
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <h3 className="font-heading text-lg font-bold">Items</h3>
              <div className="grid grid-cols-[1fr_60px_100px_80px_30px] gap-2 text-xs font-body text-muted-foreground px-1">
                <span>Description</span><span>Qty</span><span>Unit Price</span><span>Total</span><span />
              </div>
              {form.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_60px_100px_80px_30px] gap-2 items-center group">
                  <input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} placeholder="Item description"
                    className="bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage placeholder:text-muted-foreground/50" />
                  <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                    className="bg-transparent border-b border-border py-2 font-mono text-sm outline-none focus:border-sage text-center" />
                  <input type="number" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))}
                    className="bg-transparent border-b border-border py-2 font-mono text-sm outline-none focus:border-sage" />
                  <span className="font-mono text-sm text-right">{formatPKR(item.qty * item.unitPrice)}</span>
                  <button onClick={() => removeItem(idx)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all">
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              <button onClick={addItem} className="flex items-center gap-1 text-sage text-sm font-body font-medium hover:opacity-80 transition-opacity mt-2">
                <Plus size={14} strokeWidth={1.5} /> Add Item
              </button>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex justify-between font-body text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-mono">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center font-body text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Tax</span>
                  <input type="number" value={form.taxRate} onChange={e => setForm(f => ({ ...f, taxRate: Number(e.target.value) }))}
                    className="w-14 bg-transparent border-b border-border py-1 font-mono text-xs outline-none focus:border-sage text-center" />
                  <span className="text-muted-foreground">%</span>
                </div>
                <span className="font-mono">{formatPKR(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center font-body text-sm">
                <span className="text-muted-foreground">Discount</span>
                <input type="number" value={form.discount} onChange={e => setForm(f => ({ ...f, discount: Number(e.target.value) }))}
                  className="w-24 bg-transparent border-b border-border py-1 font-mono text-sm outline-none focus:border-sage text-right" />
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-body font-medium">Total</span>
                <span className="font-mono text-2xl font-bold">{formatPKR(total)}</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <label className="font-body text-xs text-muted-foreground mb-2 block">Notes / Payment Instructions</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
                className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage resize-none placeholder:text-muted-foreground/50" />
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => saveInvoice('draft')} disabled={saving} className="flex items-center gap-2 border border-border px-6 py-3 rounded-full font-body text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50">
                <Save size={16} strokeWidth={1.5} /> Save Draft
              </button>
              <button onClick={generatePDF} className="flex items-center gap-2 bg-sage text-primary-foreground px-6 py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity">
                <FileDown size={16} strokeWidth={1.5} /> Preview PDF
              </button>
              <button onClick={() => saveInvoice('unpaid')} disabled={saving} className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                <Send size={16} strokeWidth={1.5} /> Send Invoice
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20 bg-card border border-border rounded-2xl p-8 shadow-sm print-area">
              <div className="flex justify-between items-start mb-6">
                <div>
                  {brand.logo && <img src={brand.logo} alt="Logo" className="h-8 mb-2" />}
                  <div className="font-heading text-lg font-bold">{brand.businessName || 'Your Business'}</div>
                  <div className="font-body text-xs text-muted-foreground">{brand.city} • {brand.phone}</div>
                </div>
                <div className="text-right">
                  <div className="font-heading text-2xl font-bold">INVOICE</div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">{form.number}</div>
                  <div className="font-body text-xs text-muted-foreground">Date: {form.date}</div>
                  {form.dueDate && <div className="font-body text-xs text-muted-foreground">Due: {form.dueDate}</div>}
                </div>
              </div>
              <div className="h-0.5 w-full mb-4" style={{ backgroundColor: brand.brandColor || '#1C1917' }} />
              <div className="mb-6">
                <div className="font-body text-xs text-muted-foreground">Bill To</div>
                <div className="font-body text-sm font-medium">{form.clientName || '—'}</div>
                <div className="font-body text-xs text-muted-foreground">{form.clientEmail}</div>
                <div className="font-body text-xs text-muted-foreground">{form.clientAddress}</div>
              </div>
              <table className="w-full mb-4 text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-body text-xs text-muted-foreground">Description</th>
                    <th className="text-center py-2 font-body text-xs text-muted-foreground">Qty</th>
                    <th className="text-right py-2 font-body text-xs text-muted-foreground">Price</th>
                    <th className="text-right py-2 font-body text-xs text-muted-foreground">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((item, idx) => (
                    <tr key={idx} className={`${idx % 2 === 1 ? 'bg-background' : ''}`}>
                      <td className="py-2 font-body text-xs">{item.description || '—'}</td>
                      <td className="py-2 font-mono text-xs text-center">{item.qty}</td>
                      <td className="py-2 font-mono text-xs text-right">{formatPKR(item.unitPrice)}</td>
                      <td className="py-2 font-mono text-xs text-right">{formatPKR(item.qty * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-border pt-3 space-y-1 text-right">
                <div className="flex justify-end gap-6 font-body text-xs"><span className="text-muted-foreground">Subtotal</span><span className="font-mono">{formatPKR(subtotal)}</span></div>
                <div className="flex justify-end gap-6 font-body text-xs"><span className="text-muted-foreground">Tax ({form.taxRate}%)</span><span className="font-mono">{formatPKR(taxAmount)}</span></div>
                {form.discount > 0 && <div className="flex justify-end gap-6 font-body text-xs"><span className="text-muted-foreground">Discount</span><span className="font-mono">-{formatPKR(form.discount)}</span></div>}
                <div className="flex justify-end gap-6 pt-2 border-t border-border"><span className="font-body font-medium">Total</span><span className="font-mono text-lg font-bold">{formatPKR(total)}</span></div>
              </div>
              {form.notes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="font-body text-xs text-muted-foreground whitespace-pre-line">{form.notes}</div>
                </div>
              )}
              <div className="mt-8 text-center">
                <div className="font-body text-xs text-muted-foreground/50">Generated by BillBook • billbook.pk</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
