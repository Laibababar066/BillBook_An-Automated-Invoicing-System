import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, PlusCircle, Settings as SettingsIcon, Crown, Search, Bell, LogOut } from 'lucide-react';
import { BillBookLogo } from './BillBookLogo';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { ReactNode } from 'react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Invoices', icon: FileText, path: '/invoices' },
  { label: 'Clients', icon: Users, path: '/clients' },
  { label: 'New Invoice', icon: PlusCircle, path: '/invoices/new' },
  { label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { brand } = useApp();
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 flex-col border-r border-border bg-card fixed h-screen z-30">
        <div className="p-5 border-b border-border">
          <BillBookLogo size="sm" />
          {brand.businessName && (
            <p className="text-xs text-muted-foreground mt-1 font-body truncate">{brand.businessName}</p>
          )}
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-all duration-200 ${
                  active ? 'bg-sage-light text-foreground font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon size={18} strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4">
          <div className="bg-sage-light rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={16} strokeWidth={1.5} className="text-sage" />
              <span className="text-xs font-body font-medium text-foreground">Upgrade to Pro</span>
            </div>
            <p className="text-xs text-muted-foreground font-body mb-3">Rs. 299/mo • Unlimited invoices</p>
            <button className="w-full bg-foreground text-primary-foreground text-xs py-2 rounded-full font-body font-medium hover:opacity-90 transition-opacity">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 flex-1">
            <div className="md:hidden"><BillBookLogo size="sm" /></div>
            <div className="hidden md:flex items-center gap-2 bg-muted rounded-full px-4 py-2 w-72">
              <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <input placeholder="Search invoices, clients..." className="bg-transparent text-sm font-body outline-none w-full placeholder:text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <Bell size={18} strokeWidth={1.5} className="text-muted-foreground" />
            </button>
            <button onClick={() => { signOut(); navigate('/auth'); }} className="p-2 rounded-full hover:bg-muted transition-colors" title="Sign out">
              <LogOut size={18} strokeWidth={1.5} className="text-muted-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full bg-foreground text-primary-foreground flex items-center justify-center text-xs font-body font-medium">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border flex justify-around py-2">
        {navItems.slice(0, 4).map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 ${active ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              <item.icon size={20} strokeWidth={1.5} />
              <span className="text-[10px] font-body">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
