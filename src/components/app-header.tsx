import { LogOut, Wallet } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/auth-actions';
import { useTransition } from 'react';


interface AppHeaderProps {
  currencies: string[];
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
  user: {
    email: string;
  } | null;
}

export function AppHeader({ currencies, selectedCurrency, onCurrencyChange, user }: AppHeaderProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    startTransition(async () => {
      await logout();
    });
  };

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  }

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
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    {/* Placeholder for user avatar image */}
                    <AvatarImage src="" alt={user.email || 'User'} />
                    <AvatarFallback>
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Signed in as</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer" disabled={isPending}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
