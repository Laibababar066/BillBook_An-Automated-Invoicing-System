import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useApp, formatPKR } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileDown, Check, Trash2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const tabs = ['All', 'Paid', 'Unpaid', 'Overdue', 'Draft'];

export default function InvoiceList() {
  const { invoices, setInvoices } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = invoices.filter(i => {
    const matchTab = tab === 'All' || i.status.toLowerCase() === tab.toLowerCase();
    const matchSearch = i.clientName.toLowerCase().includes(search.toLowerCase()) || i.number.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const toggleSelect = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const markPaid = (ids: string[]) => {
    setInvoices(prev => prev.map(i => ids.includes(i.id) ? { ...i, status: 'paid' as const } : i));
    setSelected([]);
    toast({ title: 'Marked as paid ✓' });
  };
  const deleteInvoices = (ids: string[]) => {
    setInvoices(prev => prev.filter(i => !ids.includes(i.id)));
    setSelected([]);
    toast({ title: 'Deleted ✓' });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-sage-light text-sage',
      unpaid: 'bg-blush/30 text-foreground',
      overdue: 'bg-destructive/10 text-destructive',
      draft: 'bg-muted text-muted-foreground',
    };
    return `px-3 py-1 rounded-full text-xs font-body font-medium capitalize ${styles[status] || styles.draft}`;
  };

  return (
    <AppShell>
      <div className="animate-fade-up space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold">All Invoices</h1>
          <button onClick={() => navigate('/invoices/new')}
            className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus size={16} strokeWidth={1.5} /> New Invoice
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-body transition-all ${tab === t ? 'bg-foreground text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 max-w-md">
          <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or invoice #..."
            className="bg-transparent font-body text-sm outline-none w-full placeholder:text-muted-foreground/50" />
        </div>

        {/* Bulk actions */}
        {selected.length > 0 && (
          <div className="flex items-center gap-3 bg-sage-light rounded-xl px-4 py-3 animate-fade-up">
            <span className="font-body text-sm">{selected.length} selected</span>
            <button onClick={() => markPaid(selected)} className="flex items-center gap-1 text-sm font-body text-sage hover:text-foreground transition-colors">
              <Check size={14} strokeWidth={1.5} /> Mark as Paid
            </button>
            <button onClick={() => deleteInvoices(selected)} className="flex items-center gap-1 text-sm font-body text-destructive hover:opacity-80 transition-opacity">
              <Trash2 size={14} strokeWidth={1.5} /> Delete
            </button>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-10 px-4 py-3"><input type="checkbox" className="rounded"
                      checked={selected.length === filtered.length && filtered.length > 0}
                      onChange={e => setSelected(e.target.checked ? filtered.map(i => i.id) : [])} /></th>
                    <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground">Invoice #</th>
                    <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground hidden md:table-cell">Issue Date</th>
                    <th className="text-left px-4 py-3 text-xs font-body font-medium text-muted-foreground hidden md:table-cell">Due Date</th>
                    <th className="text-right px-4 py-3 text-xs font-body font-medium text-muted-foreground">Amount</th>
                    <th className="text-center px-4 py-3 text-xs font-body font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-3 text-xs font-body font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv, i) => (
                    <tr key={inv.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-background' : ''}`}>
                      <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} className="rounded" /></td>
                      <td className="px-4 py-3 font-mono text-sm">{inv.number}</td>
                      <td className="px-4 py-3 font-body text-sm">{inv.clientName}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground hidden md:table-cell">{inv.date}</td>
                      <td className="px-4 py-3 font-body text-sm text-muted-foreground hidden md:table-cell">{inv.dueDate || '—'}</td>
                      <td className="px-4 py-3 font-mono text-sm text-right">{formatPKR(inv.amount)}</td>
                      <td className="px-4 py-3 text-center"><span className={statusBadge(inv.status)}>{inv.status}</span></td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="View"><FileText size={14} strokeWidth={1.5} /></button>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Download"><FileDown size={14} strokeWidth={1.5} /></button>
                          {inv.status !== 'paid' && (
                            <button onClick={() => markPaid([inv.id])} className="p-1.5 rounded-lg hover:bg-sage-light transition-colors" title="Mark Paid">
                              <Check size={14} strokeWidth={1.5} className="text-sage" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <FileText size={48} strokeWidth={1} className="mx-auto text-muted-foreground/30 mb-4" />
            <p className="font-body text-muted-foreground mb-4">No invoices yet — create your first one</p>
            <button onClick={() => navigate('/invoices/new')} className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-full font-body text-sm font-medium">
              Create Invoice
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
