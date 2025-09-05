'use client';

import { useState, useEffect } from 'react';
import { BellRing, CalendarDays } from 'lucide-react';
import { addMonths, format, formatDistanceToNow } from 'date-fns';
import type { Expense } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpcomingPaymentsProps {
  expenses: Expense[];
  currencyFormatter: (amount: number) => string;
}

export function UpcomingPayments({ expenses, currencyFormatter }: UpcomingPaymentsProps) {
  const [upcoming, setUpcoming] = useState< (Expense & { nextDueDate: Date; distance: string })[] >([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const getNextDueDate = (expenseDate: Date): Date => {
        const today = new Date();
        let nextDueDate = new Date(expenseDate);
        while (nextDueDate < today) {
          nextDueDate = addMonths(nextDueDate, 1);
        }
        return nextDueDate;
      };

      const upcomingPayments = expenses
        .map(e => ({ 
          ...e, 
          nextDueDate: getNextDueDate(e.date),
          distance: formatDistanceToNow(getNextDueDate(e.date), { addSuffix: true })
        }))
        .sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime())
        .slice(0, 5);

      setUpcoming(upcomingPayments);
    }
  }, [expenses, isClient]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5" />
          Upcoming Payments
        </CardTitle>
        <CardDescription>A list of your upcoming recurring bills and payments.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {upcoming.length > 0 ? (
          upcoming.map(expense => (
            <div key={expense.id} className="flex items-center gap-4">
              <div className="bg-muted rounded-lg p-3 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">{format(expense.nextDueDate, 'MMM')}</span>
                <span className="text-xl font-bold">{format(expense.nextDueDate, 'dd')}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium truncate">{expense.description}</p>
                <p className="text-sm text-muted-foreground">{currencyFormatter(expense.amount)}</p>
              </div>
              {isClient && (
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {expense.distance}
                </Badge>
              )}
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <CalendarDays className="mx-auto h-12 w-12" />
            <p className="mt-4 text-sm">No upcoming payments found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
