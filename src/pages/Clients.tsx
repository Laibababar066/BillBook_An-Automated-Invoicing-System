import { useState } from 'react';
import AppShell from '@/components/AppShell';
import { useApp, formatPKR, type Client } from '@/context/AppContext';
import { Plus, Search, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Clients() {
  const { clients, setClients } = useApp();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', business: '', email: '', phone: '', city: '', address: '' });

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase())
  );

  const addClient = () => {
    if (!newClient.name) return;
    const client: Client = {
      id: Date.now().toString(),
      ...newClient,
      totalBilled: 0,
      invoiceCount: 0,
    };
    setClients(prev => [...prev, client]);
    setNewClient({ name: '', business: '', email: '', phone: '', city: '', address: '' });
    setShowModal(false);
    toast({ title: 'Client added ✓' });
  };

  return (
    <AppShell>
      <div className="animate-fade-up space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="font-heading text-3xl font-bold">Your Clients</h1>
          <button onClick={() => setShowModal(true)}
            className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            <Plus size={16} strokeWidth={1.5} /> Add Client
          </button>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2.5 max-w-md">
          <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or city..."
            className="bg-transparent font-body text-sm outline-none w-full placeholder:text-muted-foreground/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="bg-card border border-border rounded-2xl p-5 hover-lift group hover:border-sage transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-sage-light text-sage flex items-center justify-center font-body font-medium">
                  {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-body text-sm font-medium">{c.name}</div>
                  <div className="font-body text-xs text-muted-foreground">{c.city}</div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-mono">{formatPKR(c.totalBilled)}</span>
                <span className="font-body text-xs text-muted-foreground">{c.invoiceCount} invoices</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-body text-muted-foreground mb-4">No clients found</p>
            <button onClick={() => setShowModal(true)} className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-full font-body text-sm font-medium">
              Add Your First Client
            </button>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4 animate-fade-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-xl font-bold">Add Client</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={18} strokeWidth={1.5} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { key: 'name', label: 'Full Name', placeholder: 'e.g. Ahmed Khan' },
                  { key: 'business', label: 'Business Name', placeholder: 'e.g. Ahmed Trading' },
                  { key: 'email', label: 'Email', placeholder: 'ahmed@email.com' },
                  { key: 'phone', label: 'Phone', placeholder: '+92 300 1234567' },
                  { key: 'city', label: 'City', placeholder: 'Karachi' },
                  { key: 'address', label: 'Address', placeholder: 'Full address' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="font-body text-xs text-muted-foreground mb-1 block">{field.label}</label>
                    <input value={(newClient as any)[field.key]} onChange={e => setNewClient(nc => ({ ...nc, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full bg-transparent border-b border-border py-2 font-body text-sm outline-none focus:border-sage placeholder:text-muted-foreground/50" />
                  </div>
                ))}
              </div>
              <button onClick={addClient} className="w-full mt-6 bg-foreground text-primary-foreground py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity">
                Save Client
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
