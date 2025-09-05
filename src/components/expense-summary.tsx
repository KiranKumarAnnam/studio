'use client';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  isToday,
  isThisMonth,
} from 'date-fns';
import { DollarSign, BarChartBig } from 'lucide-react';


interface ExpenseSummaryProps {
  expenses: Expense[];
  currencyFormatter: (amount: number) => string;
}

export function ExpenseSummary({ expenses, currencyFormatter }: ExpenseSummaryProps) {
  const dailyTotal = expenses
    .filter(e => isToday(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyTotal = expenses
    .filter(e => isThisMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
    </div>
  );
}
