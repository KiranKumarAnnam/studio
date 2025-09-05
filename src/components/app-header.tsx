
import { Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AppHeaderProps {
  currencies: string[];
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function AppHeader({ currencies, selectedCurrency, onCurrencyChange }: AppHeaderProps) {

  return (
    <header className="bg-card border-b p-4 sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-headline flex-1">
          SpendWise
        </h1>
        <div className="flex items-center gap-4">
          <div className="w-32">
            <Select value={selectedCurrency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </header>
  );
}
