import React, { createContext, useContext, useState, useEffect } from 'react';

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

const defaultClients = [
  { id: '1', name: 'Ahmed Trading Co.', business: 'Ahmed & Sons Trading', email: 'ahmed@trading.pk', phone: '+92 300 1234567', city: 'Karachi', address: 'Block 7, Clifton, Karachi', totalBilled: 145000, invoiceCount: 12 },
  { id: '2', name: 'Fatima Boutique', business: 'Fatima Fashion House', email: 'fatima@boutique.pk', phone: '+92 321 9876543', city: 'Lahore', address: 'MM Alam Road, Gulberg III, Lahore', totalBilled: 89500, invoiceCount: 8 },
  { id: '3', name: 'Usman Tech Solutions', business: 'Usman IT Services', email: 'usman@techsol.pk', phone: '+92 333 5551234', city: 'Islamabad', address: 'Blue Area, F-6, Islamabad', totalBilled: 234000, invoiceCount: 15 },
  { id: '4', name: 'Zara Interiors', business: 'Zara Design Studio', email: 'zara@interiors.pk', phone: '+92 345 6789012', city: 'Lahore', address: 'DHA Phase 5, Lahore', totalBilled: 67000, invoiceCount: 5 },
];

const defaultInvoices = [
  { id: '1', number: 'INV-001', clientId: '1', clientName: 'Ahmed Trading Co.', date: '2026-03-01', dueDate: '2026-03-31', amount: 25000, status: 'paid' as const, items: [{ description: 'Web Design Services', qty: 1, unitPrice: 25000 }], notes: '' },
  { id: '2', number: 'INV-002', clientId: '2', clientName: 'Fatima Boutique', date: '2026-03-03', dueDate: '2026-03-18', amount: 15500, status: 'unpaid' as const, items: [{ description: 'Logo Design', qty: 1, unitPrice: 15500 }], notes: '' },
  { id: '3', number: 'INV-003', clientId: '3', clientName: 'Usman Tech Solutions', date: '2026-02-28', dueDate: '2026-03-15', amount: 44000, status: 'paid' as const, items: [{ description: 'Monthly IT Support', qty: 1, unitPrice: 44000 }], notes: '' },
  { id: '4', number: 'INV-004', clientId: '1', clientName: 'Ahmed Trading Co.', date: '2026-03-05', dueDate: '2026-04-05', amount: 8000, status: 'unpaid' as const, items: [{ description: 'Business Cards Print', qty: 500, unitPrice: 16 }], notes: '' },
  { id: '5', number: 'INV-005', clientId: '4', clientName: 'Zara Interiors', date: '2026-03-07', dueDate: '2026-03-07', amount: 23500, status: 'draft' as const, items: [{ description: 'Interior Consultation', qty: 1, unitPrice: 23500 }], notes: '' },
];

export type InvoiceStatus = 'paid' | 'unpaid' | 'overdue' | 'draft';

export type Client = typeof defaultClients[0];
export type Invoice = {
  id: string; number: string; clientId: string; clientName: string;
  date: string; dueDate: string; amount: number; status: InvoiceStatus;
  items: InvoiceItem[]; notes: string;
};
export type BrandSettings = typeof defaultBrand;
export type InvoiceItem = { description: string; qty: number; unitPrice: number };

interface AppContextType {
  brand: BrandSettings;
  setBrand: React.Dispatch<React.SetStateAction<BrandSettings>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<BrandSettings>(() => {
    const saved = localStorage.getItem('billbook-brand');
    return saved ? JSON.parse(saved) : defaultBrand;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('billbook-clients');
    return saved ? JSON.parse(saved) : defaultClients;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('billbook-invoices');
    return saved ? JSON.parse(saved) : defaultInvoices;
  });

  useEffect(() => { localStorage.setItem('billbook-brand', JSON.stringify(brand)); }, [brand]);
  useEffect(() => { localStorage.setItem('billbook-clients', JSON.stringify(clients)); }, [clients]);
  useEffect(() => { localStorage.setItem('billbook-invoices', JSON.stringify(invoices)); }, [invoices]);

  return (
    <AppContext.Provider value={{ brand, setBrand, clients, setClients, invoices, setInvoices }}>
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
