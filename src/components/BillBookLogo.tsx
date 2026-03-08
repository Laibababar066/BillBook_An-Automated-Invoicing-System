import { FileText } from 'lucide-react';

export function BillBookLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' };
  const iconSizes = { sm: 16, md: 20, lg: 28 };
  return (
    <div className="flex items-center gap-2">
      <FileText size={iconSizes[size]} className="text-sage" strokeWidth={1.5} />
      <span className={`font-heading font-bold text-foreground ${sizes[size]}`}>BillBook</span>
    </div>
  );
}
