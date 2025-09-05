import { Wallet } from 'lucide-react';

export function AppHeader() {
  return (
    <header className="bg-card border-b p-4 sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
            <Wallet className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground font-headline">
          SpendWise
        </h1>
      </div>
    </header>
  );
}
