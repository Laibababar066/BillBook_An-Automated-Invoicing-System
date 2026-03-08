import AppShell from '@/components/AppShell';
import { useApp, formatPKR } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Clock, AlertTriangle, ArrowRight, PlusCircle, Users, Download } from 'lucide-react';

export default function Dashboard() {
  const { invoices, clients } = useApp();
  const navigate = useNavigate();

  const paid = invoices.filter(i => i.status === 'paid');
  const unpaid = invoices.filter(i => i.status === 'unpaid');
  const overdue = invoices.filter(i => i.status === 'overdue');
  const totalThisMonth = invoices.reduce((s, i) => s + i.amount, 0);
  const paidTotal = paid.reduce((s, i) => s + i.amount, 0);
  const unpaidTotal = unpaid.reduce((s, i) => s + i.amount, 0);

  const stats = [
    { label: 'Total Invoiced', amount: totalThisMonth, icon: TrendingUp, color: 'text-foreground' },
    { label: 'Paid', amount: paidTotal, icon: CheckCircle, color: 'text-sage' },
    { label: 'Unpaid', amount: unpaidTotal, icon: Clock, color: 'text-blush' },
    { label: 'Overdue', amount: overdue.reduce((s, i) => s + i.amount, 0), icon: AlertTriangle, color: 'text-muted-foreground' },
  ];

  const topClients = [...clients].sort((a, b) => b.totalBilled - a.totalBilled).slice(0, 4);
  const recentInvoices = invoices.slice(0, 5);

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
      <div className="animate-fade-up space-y-8 pb-20 md:pb-0">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">Here's what's happening with your invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 hover-lift" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-xs text-muted-foreground">{s.label}</span>
                <s.icon size={16} strokeWidth={1.5} className={s.color} />
              </div>
              <div className={`font-heading text-2xl font-bold ${s.color}`}>{formatPKR(s.amount)}</div>
            </div>
          ))}
        </div>

        {/* Recent Invoices */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="font-heading text-xl font-bold">Recent Invoices</h2>
            <button onClick={() => navigate('/invoices')} className="text-sm font-body text-sage hover:text-foreground transition-colors flex items-center gap-1">
              View All <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-body font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left px-5 py-3 text-xs font-body font-medium text-muted-foreground">Client</th>
                  <th className="text-left px-5 py-3 text-xs font-body font-medium text-muted-foreground hidden md:table-cell">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-body font-medium text-muted-foreground">Amount</th>
                  <th className="text-center px-5 py-3 text-xs font-body font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((inv, i) => (
                  <tr key={inv.id} className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-background' : ''}`}>
                    <td className="px-5 py-3.5 font-mono text-sm">{inv.number}</td>
                    <td className="px-5 py-3.5 font-body text-sm">{inv.clientName}</td>
                    <td className="px-5 py-3.5 font-body text-sm text-muted-foreground hidden md:table-cell">{inv.date}</td>
                    <td className="px-5 py-3.5 font-mono text-sm text-right">{formatPKR(inv.amount)}</td>
                    <td className="px-5 py-3.5 text-center"><span className={statusBadge(inv.status)}>{inv.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/invoices/new')} className="bg-foreground text-primary-foreground rounded-2xl p-6 text-left hover:opacity-90 transition-opacity group">
            <PlusCircle size={22} strokeWidth={1.5} className="mb-3" />
            <div className="font-body font-medium">New Invoice</div>
            <div className="text-xs text-primary-foreground/70 font-body mt-1 flex items-center gap-1">Create now <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></div>
          </button>
          <button onClick={() => navigate('/clients')} className="bg-sage text-primary-foreground rounded-2xl p-6 text-left hover:opacity-90 transition-opacity group">
            <Users size={22} strokeWidth={1.5} className="mb-3" />
            <div className="font-body font-medium">Add Client</div>
            <div className="text-xs text-primary-foreground/70 font-body mt-1 flex items-center gap-1">Manage <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></div>
          </button>
          <button className="border border-border bg-card text-foreground rounded-2xl p-6 text-left hover-lift group">
            <Download size={22} strokeWidth={1.5} className="mb-3 text-muted-foreground" />
            <div className="font-body font-medium">Download Report</div>
            <div className="text-xs text-muted-foreground font-body mt-1 flex items-center gap-1">Export CSV <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" /></div>
          </button>
        </div>

        {/* Top Clients */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="font-heading text-xl font-bold mb-4">Top Clients by Revenue</h2>
          <div className="space-y-3">
            {topClients.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-background transition-colors">
                <div className="w-10 h-10 rounded-full bg-sage-light text-sage flex items-center justify-center text-sm font-body font-medium">
                  {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body text-sm font-medium truncate">{c.name}</div>
                  <div className="font-body text-xs text-muted-foreground">{c.invoiceCount} invoices</div>
                </div>
                <div className="font-mono text-sm font-medium">{formatPKR(c.totalBilled)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard hints */}
        <div className="text-center font-body text-xs text-muted-foreground/50 hidden md:block">
          N = New Invoice &nbsp;•&nbsp; C = Clients
        </div>
      </div>
    </AppShell>
  );
}
