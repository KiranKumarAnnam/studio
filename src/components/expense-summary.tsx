'use client';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { addDays, isToday, isThisMonth, isThisWeek, isThisYear, startOfYear, endOfYear, startOfWeek, endOfWeek } from 'date-fns';
import { BarChartBig, Calendar as CalendarIcon, DollarSign, X, Plus } from 'lucide-react';

import type { Expense, SummaryPeriod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface ExpenseSummaryProps {
  expenses: Expense[];
  currencyFormatter: (amount: number) => string;
  additionalSummaries: SummaryPeriod[];
  onAddSummary: (period: SummaryPeriod) => void;
  onRemoveSummary: (id: string) => void;
}

const summaryOptions: SummaryPeriod[] = [
    { id: 'this_week', label: 'This Week' },
    { id: 'this_year', label: 'This Year' },
    { id: 'custom_range', label: 'Custom Range...' },
];

export function ExpenseSummary({ expenses, currencyFormatter, additionalSummaries, onAddSummary, onRemoveSummary }: ExpenseSummaryProps) {
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>({ from: new Date(), to: addDays(new Date(), 7) });

  const calculateTotal = (period: SummaryPeriod) => {
    let filteredExpenses = expenses;
    switch (period.id) {
      case 'today':
        filteredExpenses = expenses.filter(e => isToday(e.date));
        break;
      case 'this_month':
        filteredExpenses = expenses.filter(e => isThisMonth(e.date));
        break;
      case 'this_week':
        filteredExpenses = expenses.filter(e => isThisWeek(e.date, { weekStartsOn: 1 }));
        break;
      case 'this_year':
        filteredExpenses = expenses.filter(e => isThisYear(e.date));
        break;
      case 'custom_range':
        if (customDateRange?.from && customDateRange?.to) {
          filteredExpenses = expenses.filter(e => e.date >= customDateRange!.from! && e.date <= customDateRange!.to!);
        } else {
            return 0;
        }
        break;
    }
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  };
  
  const permanentSummaries: SummaryPeriod[] = [
    { id: 'today', label: 'Today', icon: DollarSign },
    { id: 'this_month', label: 'This Month', icon: BarChartBig },
  ];
  
  const allSummaries = [...permanentSummaries, ...additionalSummaries];
  
  const availableOptions = summaryOptions.filter(opt => !additionalSummaries.some(p => p.id === opt.id));

  return (
    <div>
        <div className="flex items-center justify-between mb-4">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Summary</h2>
                <p className="text-muted-foreground">An overview of your expenses.</p>
            </div>
            {availableOptions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <Plus className="mr-2 h-4 w-4" /> Add Summary
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {availableOptions.map(option => (
                            <DropdownMenuItem key={option.id} onSelect={() => onAddSummary(option)}>
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {allSummaries.map((period) => {
                const isPermanent = permanentSummaries.some(p => p.id === period.id);
                const Icon = period.icon;
                return (
                    <Card key={period.id} className="relative hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                             <CardTitle className="text-sm font-medium">{period.label}</CardTitle>
                             {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{currencyFormatter(calculateTotal(period))}</div>
                            {period.id === 'custom_range' && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button id="date" variant="outline" size="sm" className="w-full justify-start text-left font-normal mt-2">
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {customDateRange?.from ? (
                                                customDateRange.to ? (
                                                <>
                                                    {format(customDateRange.from, 'LLL dd, y')} - {format(customDateRange.to, 'LLL dd, y')}
                                                </>
                                                ) : (
                                                format(customDateRange.from, 'LLL dd, y')
                                                )
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={customDateRange?.from}
                                            selected={customDateRange}
                                            onSelect={setCustomDateRange}
                                            numberOfMonths={2}
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        </CardContent>
                        {!isPermanent && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => onRemoveSummary(period.id)}
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove summary</span>
                            </Button>
                        )}
                    </Card>
                )
            })}
        </div>
    </div>
  );
}
