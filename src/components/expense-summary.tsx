'use client';
import { useState } from 'react';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  isWithinInterval,
  format
} from 'date-fns';
import { DollarSign, Calendar as CalendarIcon, ChevronDown, TrendingUp, BarChartBig, GanttChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';


interface ExpenseSummaryProps {
  expenses: Expense[];
  currencyFormatter: (amount: number) => string;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

type Period = 'week' | 'year' | 'custom';

export function ExpenseSummary({ expenses, currencyFormatter, dateRange, setDateRange }: ExpenseSummaryProps) {
  const [activePeriod, setActivePeriod] = useState<Period | null>(null);

  const dailyTotal = expenses
    .filter(e => isToday(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyTotal = expenses
    .filter(e => isThisMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  const calculateTotalForPeriod = () => {
    if (!activePeriod) return null;

    let filteredExpenses: Expense[] = [];
    switch (activePeriod) {
      case 'week':
        filteredExpenses = expenses.filter(e => isThisWeek(e.date, { weekStartsOn: 1 }));
        break;
      case 'year':
        filteredExpenses = expenses.filter(e => isThisYear(e.date));
        break;
      case 'custom':
        if (dateRange?.from && dateRange.to) {
          filteredExpenses = expenses.filter(e => isWithinInterval(e.date, { start: dateRange.from!, end: dateRange.to! }));
        }
        break;
      default:
        return null;
    }
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  };
  
  const getPeriodTitle = () => {
    switch(activePeriod) {
      case 'week': return 'This Week';
      case 'year': return 'This Year';
      case 'custom': 
        if(dateRange?.from && dateRange.to) return `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}`;
        if(dateRange?.from) return format(dateRange.from, "LLL dd, y");
        return 'Custom Range';
      default: return null;
    }
  }

  const getPeriodIcon = () => {
    switch(activePeriod) {
      case 'week': return CalendarIcon;
      case 'year': return TrendingUp;
      case 'custom': return GanttChart;
      default: return null;
    }
  }

  const periodTotal = calculateTotalForPeriod();
  const PeriodIcon = getPeriodIcon();

  const handlePeriodSelect = (period: Period | null) => {
    if (period !== 'custom') {
      setDateRange(undefined);
    }
    setActivePeriod(period);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencyFormatter(dailyTotal)}</div>
        </CardContent>
      </Card>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <BarChartBig className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{currencyFormatter(monthlyTotal)}</div>
        </CardContent>
      </Card>
      
      {activePeriod && periodTotal !== null && PeriodIcon && (
        <Card className="hover:shadow-md transition-shadow lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{getPeriodTitle()}</CardTitle>
            <PeriodIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter(periodTotal)}</div>
          </CardContent>
        </Card>
      )}

      <div className={cn("flex items-center justify-center lg:col-span-1", activePeriod ? 'lg:col-start-4' : 'lg:col-span-2' )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <span>More periods</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => handlePeriodSelect('week')}>This Week</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handlePeriodSelect('year')}>This Year</DropdownMenuItem>
            <DropdownMenuItem asChild>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start font-normal" onClick={() => handlePeriodSelect('custom')}>Custom Range</Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
