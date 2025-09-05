'use client';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/helpers';
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
} from 'date-fns';
import { DollarSign, Calendar, TrendingUp, BarChartBig } from 'lucide-react';

interface ExpenseSummaryProps {
  expenses: Expense[];
}

export function ExpenseSummary({ expenses }: ExpenseSummaryProps) {
  
  const dailyTotal = expenses
    .filter(e => isToday(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  const weeklyTotal = expenses
    .filter(e => isThisWeek(e.date, { weekStartsOn: 1 }))
    .reduce((sum, e) => sum + e.amount, 0);

  const monthlyTotal = expenses
    .filter(e => isThisMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  const yearlyTotal = expenses
    .filter(e => isThisYear(e.date))
    .reduce((sum, e) => sum + e.amount, 0);
  
  const summaryItems = [
    { title: 'Today', total: dailyTotal, icon: DollarSign },
    { title: 'This Week', total: weeklyTotal, icon: Calendar },
    { title: 'This Month', total: monthlyTotal, icon: BarChartBig },
    { title: 'This Year', total: yearlyTotal, icon: TrendingUp },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {summaryItems.map((item) => (
        <Card key={item.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(item.total)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
