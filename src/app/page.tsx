'use client';

import { useState } from 'react';
import type { Expense, Budget } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { ExpenseSummary } from '@/components/expense-summary';
import { ExpenseTable } from '@/components/expense-table';
import { UpcomingPayments } from '@/components/upcoming-payments';
import { ExpenseChart } from '@/components/expense-chart';
import { BudgetGoals } from '@/components/budget-goals';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/helpers';
import type { SummaryPeriod } from '@/lib/types';
import { isThisMonth, isThisYear } from 'date-fns';

const initialExpenses: Expense[] = [
  { id: '1', description: 'Groceries from Walmart', amount: 75.2, date: new Date(), category: 'Groceries' },
  { id: '2', description: 'Monthly electricity bill', amount: 120.0, date: new Date(new Date().setDate(new Date().getDate() - 2)), category: 'Bills', isRecurring: true },
  { id: '3', description: 'Dinner with friends', amount: 55.5, date: new Date(new Date().setDate(new Date().getDate() - 5)), category: 'Dining' },
  { id: '4', description: 'January Rent', amount: 1500, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), category: 'Rent', isRecurring: true},
  { id: '5', description: 'Yearly car insurance', amount: 800, date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), category: 'EMI'},
].sort((a,b) => b.date.getTime() - a.date.getTime());

const defaultCategories = ['Groceries', 'Bills', 'Rent', 'Dining', 'EMI', 'Transport', 'Health', 'Entertainment', 'Other'];

const initialBudgets: Budget[] = [
  { category: 'Groceries', limit: 400, period: 'monthly' },
  { category: 'Dining', limit: 200, period: 'monthly' },
  { category: 'Entertainment', limit: 150, period: 'monthly' },
  { category: 'Health', limit: 1000, period: 'yearly' },
];

const currencies = {
  USD: { rate: 1, symbol: '$', code: 'USD' },
  INR: { rate: 83.5, symbol: '₹', code: 'INR' },
  EUR: { rate: 0.92, symbol: '€', code: 'EUR' },
};

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [currency, setCurrency] = useState<keyof typeof currencies>('USD');
  const [additionalSummaries, setAdditionalSummaries] = useState<SummaryPeriod[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const { toast } = useToast();

  const handleSaveExpense = (expense: Omit<Expense, 'id'>) => {
    // When saving, we convert the amount back to the base currency (USD)
    const amountInUSD = expense.amount / currencies[currency].rate;
    setExpenses(prev => [...prev, { ...expense, amount: amountInUSD, id: Date.now().toString() }].sort((a,b) => b.date.getTime() - a.date.getTime()));
  };
  
  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    toast({ title: 'Expense Deleted', description: 'The expense has been removed.' });
  };
  
  const handleAddCategory = (category: string) => {
    if (category && !categories.includes(category)) {
      setCategories(prev => [...prev, category].sort());
      return true;
    }
    return false;
  };

  const handleAddSummary = (period: SummaryPeriod) => {
    if (!additionalSummaries.some(p => p.id === period.id)) {
      setAdditionalSummaries(prev => [...prev, period]);
    }
  };

  const handleRemoveSummary = (id: string) => {
    setAdditionalSummaries(prev => prev.filter(p => p.id !== id));
  };
  
  const handleSaveBudget = (budget: Omit<Budget, 'id'>) => {
    // When saving, we convert the amount back to the base currency (USD)
    const limitInUSD = budget.limit / currencies[currency].rate;
    const budgetToSave = { ...budget, limit: limitInUSD };
    
    setBudgets(prev => {
      const existingIndex = prev.findIndex(b => b.category === budget.category && b.period === budget.period);
      if (existingIndex > -1) {
        const updatedBudgets = [...prev];
        updatedBudgets[existingIndex] = budgetToSave;
        return updatedBudgets;
      }
      return [...prev, budgetToSave];
    });

    toast({ title: 'Budget Saved', description: `Your ${budget.period} budget for ${budget.category} has been set.` });
  };

  const handleDeleteBudget = (category: string, period: 'monthly' | 'yearly') => {
    setBudgets(prev => prev.filter(b => !(b.category === category && b.period === period)));
    toast({ title: 'Budget Removed', description: `The ${period} budget for ${category} has been removed.` });
  };

  const getCurrencyFormatter = (currencyCode: keyof typeof currencies) => {
    const { rate, code } = currencies[currencyCode];
    return (amount: number) => formatCurrency(amount * rate, code);
  };

  const currencyFormatter = getCurrencyFormatter(currency);
  const selectedCurrencyInfo = currencies[currency];
  
  const monthlyExpenses = expenses.filter(e => isThisMonth(e.date));
  const yearlyExpenses = expenses.filter(e => isThisYear(e.date));

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <AppHeader 
        currencies={Object.keys(currencies)}
        selectedCurrency={currency}
        onCurrencyChange={(c) => setCurrency(c as keyof typeof currencies)}
      />
      <main className="flex flex-1 flex-col gap-4 p-4 container mx-auto md:gap-8 md:p-8">
        <ExpenseSummary 
          expenses={expenses} 
          currencyFormatter={currencyFormatter}
          additionalSummaries={additionalSummaries}
          onAddSummary={handleAddSummary}
          onRemoveSummary={handleRemoveSummary}
        />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ExpenseTable
              expenses={expenses}
              categories={categories}
              onSaveExpense={handleSaveExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddCategory={handleAddCategory}
              currencyFormatter={currencyFormatter}
              currencySymbol={selectedCurrencyInfo.symbol}
            />
          </div>
          <div className="lg:col-span-2 grid gap-8 content-start">
            <UpcomingPayments 
              expenses={expenses.filter(e => e.isRecurring)}
              currencyFormatter={currencyFormatter}
            />
            <BudgetGoals 
              budgets={budgets}
              monthlyExpenses={monthlyExpenses}
              yearlyExpenses={yearlyExpenses}
              categories={categories}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
              currencyFormatter={currencyFormatter}
              currencySymbol={selectedCurrencyInfo.symbol}
              currencyRate={selectedCurrencyInfo.rate}
            />
            <ExpenseChart 
              expenses={expenses}
              currencyFormatter={currencyFormatter}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
