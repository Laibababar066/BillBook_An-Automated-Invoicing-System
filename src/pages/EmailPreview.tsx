export default function EmailPreview() {
  const name = 'Ahmed';
  const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-foreground text-primary-foreground px-8 py-6">
          <h1 className="font-heading text-2xl font-bold">BillBook</h1>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-5">
          <h2 className="font-heading text-2xl font-bold">Your BillBook Pro is Active! 🎉</h2>

          <p className="font-body text-sm text-muted-foreground">Hi {name},</p>

          <p className="font-body text-sm text-muted-foreground">
            Your BillBook Pro account is now active!
          </p>

          <div className="bg-sage-light rounded-xl p-5 space-y-2">
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Plan</span>
              <span className="font-medium">Pro</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Valid until</span>
              <span className="font-medium">{expiryDate}</span>
            </div>
            <div className="flex justify-between font-body text-sm">
              <span className="text-muted-foreground">Invoices</span>
              <span className="font-medium">Unlimited</span>
            </div>
          </div>

          <p className="font-body text-sm text-muted-foreground">You can now:</p>
          <ul className="space-y-1.5 font-body text-sm text-muted-foreground">
            <li>✓ Create unlimited invoices</li>
            <li>✓ Add unlimited clients</li>
            <li>✓ Use custom branding on all PDFs</li>
          </ul>

          <a
            href="/dashboard"
            className="block w-full bg-foreground text-primary-foreground text-center py-3 rounded-full font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Open BillBook →
          </a>

          <p className="font-body text-xs text-muted-foreground">
            Questions? WhatsApp: 0304-9237379
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border">
          <p className="font-body text-[11px] text-muted-foreground/50 text-center">
            — The BillBook Team
          </p>
        </div>
      </div>
    </div>
  );
}
