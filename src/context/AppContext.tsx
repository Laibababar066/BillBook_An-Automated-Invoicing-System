import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

const defaultBrand = {
  businessName: '',
  businessType: '',
  city: '',
  phone: '',
  logo: null as string | null,
  brandColor: '#1C1917',
  fontStyle: 'Classic',
  currency: 'PKR',
  taxRate: 17,
  paymentTerms: 'Net 30',
  invoicePrefix: 'INV',
  nextInvoiceNumber: 1,
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  preferCash: false,
  cashInstructions: '',
  onboardingComplete: false,
};

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'draft';

export type Client = {
  id: string;
  name: string;
  business: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  totalBilled: number;
  invoiceCount: number;
};

export type InvoiceItem = { description: string; qty: number; unitPrice: number };

export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes: string;
};

export type BrandSettings = typeof defaultBrand;

interface AppContextType {
  brand: BrandSettings;
  setBrand: React.Dispatch<React.SetStateAction<BrandSettings>>;
  clients: Client[];
  invoices: Invoice[];
  loading: boolean;
  addClient: (client: Omit<Client, 'id' | 'totalBilled' | 'invoiceCount'>) => Promise<Client | null>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<Invoice | null>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  deleteInvoices: (ids: string[]) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [brand, setBrand] = useState<BrandSettings>(() => {
    const saved = localStorage.getItem('billbook-brand');
    return saved ? JSON.parse(saved) : defaultBrand;
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('billbook-brand', JSON.stringify(brand));
  }, [brand]);

  const fetchClients = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (data) {
      setClients(data.map(c => ({
        id: c.id,
        name: c.name,
        business: c.business,
        email: c.email,
        phone: c.phone,
        city: c.city,
        address: c.address,
        totalBilled: Number(c.total_billed),
        invoiceCount: c.invoice_count,
      })));
    }
  }, [user]);

  const fetchInvoices = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('invoices').select('*, invoice_items(*)').order('created_at', { ascending: false });
    if (data) {
      setInvoices(data.map(inv => ({
        id: inv.id,
        number: inv.number,
        clientId: inv.client_id || '',
        clientName: inv.client_name,
        date: inv.date,
        dueDate: inv.due_date,
        amount: Number(inv.amount),
        status: inv.status as InvoiceStatus,
        items: (inv.invoice_items || []).map((item: any) => ({
          description: item.description,
          qty: item.qty,
          unitPrice: Number(item.unit_price),
        })),
        notes: inv.notes,
      })));
    }
  }, [user]);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchClients(), fetchInvoices()]);
    setLoading(false);
  }, [fetchClients, fetchInvoices]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      setClients([]);
      setInvoices([]);
      setLoading(false);
    }
  }, [user, refreshData]);

  const addClient = async (client: Omit<Client, 'id' | 'totalBilled' | 'invoiceCount'>): Promise<Client | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from('clients').insert({
      user_id: user.id,
      name: client.name,
      business: client.business,
      email: client.email,
      phone: client.phone,
      city: client.city,
      address: client.address,
    }).select().single();
    if (error || !data) return null;
    const newClient: Client = {
      id: data.id,
      name: data.name,
      business: data.business,
      email: data.email,
      phone: data.phone,
      city: data.city,
      address: data.address,
      totalBilled: 0,
      invoiceCount: 0,
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.business !== undefined) dbUpdates.business = updates.business;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.totalBilled !== undefined) dbUpdates.total_billed = updates.totalBilled;
    if (updates.invoiceCount !== undefined) dbUpdates.invoice_count = updates.invoiceCount;
    await supabase.from('clients').update(dbUpdates).eq('id', id);
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClient = async (id: string) => {
    await supabase.from('clients').delete().eq('id', id);
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addInvoice = async (invoice: Omit<Invoice, 'id'>): Promise<Invoice | null> => {
    if (!user) return null;
    const { data, error } = await supabase.from('invoices').insert({
      user_id: user.id,
      number: invoice.number,
      client_id: invoice.clientId || null,
      client_name: invoice.clientName,
      date: invoice.date,
      due_date: invoice.dueDate,
      amount: invoice.amount,
      status: invoice.status,
      notes: invoice.notes,
    }).select().single();
    if (error || !data) return null;

    // Insert items
    if (invoice.items.length > 0) {
      await supabase.from('invoice_items').insert(
        invoice.items.map(item => ({
          invoice_id: data.id,
          description: item.description,
          qty: item.qty,
          unit_price: item.unitPrice,
        }))
      );
    }

    const newInvoice: Invoice = { ...invoice, id: data.id };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    const dbUpdates: any = {};
    if (updates.number !== undefined) dbUpdates.number = updates.number;
    if (updates.clientId !== undefined) dbUpdates.client_id = updates.clientId || null;
    if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    await supabase.from('invoices').update(dbUpdates).eq('id', id);
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInvoice = async (id: string) => {
    await supabase.from('invoices').delete().eq('id', id);
    setInvoices(prev => prev.filter(i => i.id !== id));
  };

  const deleteInvoices = async (ids: string[]) => {
    await supabase.from('invoices').delete().in('id', ids);
    setInvoices(prev => prev.filter(i => !ids.includes(i.id)));
  };

  return (
    <AppContext.Provider value={{
      brand, setBrand, clients, invoices, loading,
      addClient, updateClient, deleteClient,
      addInvoice, updateInvoice, deleteInvoice, deleteInvoices,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function formatPKR(amount: number): string {
  if (!amount && amount !== 0) return 'Rs. 0';
  const str = Math.round(amount).toString();
  let lastThree = str.substring(str.length - 3);
  const rest = str.substring(0, str.length - 3);
  if (rest !== '') lastThree = ',' + lastThree;
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return 'Rs. ' + formatted;
}
