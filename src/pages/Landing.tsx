import { useNavigate } from 'react-router-dom';
import { BillBookLogo } from '@/components/BillBookLogo';
import { ArrowRight, FileText, Users, Banknote } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-4 border-b border-border">
        <BillBookLogo />
        <div className="hidden md:flex items-center gap-8 font-body text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/auth')} className="text-sm font-body text-muted-foreground hover:text-foreground transition-colors">Login</button>
          <button onClick={() => navigate('/auth')} className="bg-foreground text-primary-foreground px-5 py-2 rounded-full text-sm font-body font-medium hover:opacity-90 transition-opacity">
            Start Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-12 py-20 md:py-32 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-up">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6">
              Invoicing so simple, your clients will notice.
            </h1>
            <p className="font-body text-lg text-muted-foreground mb-8 max-w-md">
              Professional invoices in 60 seconds. Built for Pakistani businesses, with PKR native support.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/auth')} className="bg-foreground text-primary-foreground px-8 py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                Start Free <ArrowRight size={16} strokeWidth={1.5} />
              </button>
              <button onClick={() => navigate('/auth')} className="border border-border text-foreground px-8 py-3 rounded-full font-body font-medium hover:bg-muted transition-colors">
                See Demo
              </button>
            </div>
          </div>

          {/* Floating invoice preview */}
          <div className="animate-fade-up hidden md:block" style={{ animationDelay: '0.15s' }}>
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="font-heading text-2xl font-bold text-foreground">INVOICE</div>
                  <div className="font-mono text-xs text-muted-foreground mt-1">INV-007</div>
                </div>
                <div className="text-right">
                  <div className="font-body text-xs text-muted-foreground">March 8, 2026</div>
                  <div className="font-body text-xs text-muted-foreground">Due: April 7, 2026</div>
                </div>
              </div>
              <div className="border-t border-border pt-4 mb-4">
                <div className="font-body text-xs text-muted-foreground mb-1">Bill To</div>
                <div className="font-body text-sm font-medium text-foreground">Ahmed Trading Co.</div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-body text-muted-foreground border-b border-border pb-1">
                  <span>Description</span><span>Amount</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span>Web Development</span><span className="font-mono">Rs. 45,000</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span>UI Design</span><span className="font-mono">Rs. 25,000</span>
                </div>
              </div>
              <div className="border-t border-border pt-3 text-right">
                <span className="font-mono text-lg font-medium text-foreground">Rs. 70,000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-12 py-20 max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">Everything you need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FileText, title: 'Beautiful PDFs', desc: 'Generate polished, print-ready invoices that make your business look premium.' },
            { icon: Users, title: 'Client Management', desc: 'Keep all your clients organized. Auto-fill details on every new invoice.' },
            { icon: Banknote, title: 'PKR Native', desc: 'Built for Pakistan. Pakistani Rupee formatting, bank details, and GST support.' },
          ].map((f, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-8 hover-lift">
              <f.icon size={28} strokeWidth={1.5} className="text-sage mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">{f.title}</h3>
              <p className="font-body text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-12 py-20 max-w-4xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-12">Simple pricing</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="font-body text-sm text-muted-foreground mb-1">Free</div>
            <div className="font-heading text-4xl font-bold mb-1">Rs. 0</div>
            <div className="font-body text-sm text-muted-foreground mb-6">Up to 5 invoices/month</div>
            <ul className="space-y-2 mb-8 font-body text-sm">
              <li>✓ Beautiful invoice templates</li>
              <li>✓ Client management</li>
              <li>✓ PDF export</li>
            </ul>
            <button onClick={() => navigate('/auth')} className="w-full border border-border text-foreground py-3 rounded-full font-body font-medium hover:bg-muted transition-colors">
              Get Started
            </button>
          </div>
          <div className="bg-foreground text-primary-foreground rounded-2xl p-8">
            <div className="font-body text-sm text-primary-foreground/70 mb-1">Pro</div>
            <div className="font-heading text-4xl font-bold mb-1">Rs. 299</div>
            <div className="font-body text-sm text-primary-foreground/70 mb-6">per month • unlimited</div>
            <ul className="space-y-2 mb-8 font-body text-sm text-primary-foreground/90">
              <li>✓ Unlimited invoices</li>
              <li>✓ Email reminders</li>
              <li>✓ Priority support</li>
              <li>✓ Custom branding</li>
            </ul>
            <button onClick={() => navigate('/auth')} className="w-full bg-primary-foreground text-foreground py-3 rounded-full font-body font-medium hover:opacity-90 transition-opacity">
              Start Pro Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 md:px-12 py-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <BillBookLogo size="sm" />
          <p className="font-body text-sm text-muted-foreground">© 2026 BillBook. Made for Pakistani businesses.</p>
        </div>
      </footer>
    </div>
  );
}
