'use client';

import { useState } from 'react';
import type { Expense } from '@/lib/types';
import { AppHeader } from '@/components/app-header';
import { ExpenseSummary } from '@/components/expense-summary';
import { ExpenseTable } from '@/components/expense-table';
import { useToast } from '@/hooks/use-toast';

const initialExpenses: Expense[] = [
  { id: '1', description: 'Groceries from Walmart', amount: 75.2, date: new Date(), category: 'Groceries' },
  { id: '2', description: 'Monthly electricity bill', amount: 120.0, date: new Date(new Date().setDate(new Date().getDate() - 2)), category: 'Bills' },
  { id: '3', description: 'Dinner with friends', amount: 55.5, date: new Date(new Date().setDate(new Date().getDate() - 5)), category: 'Dining' },
  { id: '4', description: 'January Rent', amount: 1500, date: new Date(new Date().setMonth(new Date().getMonth() - 1)), category: 'Rent'},
  { id: '5', description: 'Yearly car insurance', amount: 800, date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), category: 'EMI'},
].sort((a,b) => b.date.getTime() - a.date.getTime());

const defaultCategories = ['Groceries', 'Bills', 'Rent', 'Dining', 'EMI', 'Transport', 'Health', 'Entertainment', 'Other'];

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const { toast } = useToast();

  const handleSaveExpense = (expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: Date.now().toString() }].sort((a,b) => b.date.getTime() - a.date.getTime()));
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background font-body">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 container mx-auto md:gap-8 md:p-8">
        <ExpenseSummary expenses={expenses} />
        <ExpenseTable
          expenses={expenses}
          categories={categories}
          onSaveExpense={handleSaveExpense}
          onDeleteExpense={handleDeleteExpense}
          onAddCategory={handleAddCategory}
        />
      </main>
    </div>
  );
}
