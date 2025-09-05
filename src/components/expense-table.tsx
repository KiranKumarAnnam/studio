'use client';

import React, { useState } from 'react';
import type { Expense } from '@/lib/types';
import { exportToCsv } from '@/lib/helpers';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Download, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AddExpenseSheet } from './add-expense-sheet';

interface ExpenseTableProps {
  expenses: Expense[];
  categories: string[];
  onSaveExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddCategory: (category: string) => boolean;
  currencyFormatter: (amount: number) => string;
  currencySymbol: string;
}

export function ExpenseTable({ expenses, categories, onSaveExpense, onDeleteExpense, onAddCategory, currencyFormatter, currencySymbol }: ExpenseTableProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center">
          <div className="grid gap-2 flex-1">
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Here is a list of your most recent expenses.</CardDescription>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => exportToCsv(expenses, 'spendwise-expenses.csv')}>
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
            </Button>
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsSheetOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Expense</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length > 0 ? expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium max-w-xs truncate">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(expense.date, 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">{currencyFormatter(expense.amount)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onSelect={() => setExpenseToDelete(expense)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No expenses yet. Add one to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!expenseToDelete} onOpenChange={(open) => !open && setExpenseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense record for "{expenseToDelete?.description}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if(expenseToDelete) {
                  onDeleteExpense(expenseToDelete.id)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddExpenseSheet 
        isOpen={isSheetOpen}
        setIsOpen={setIsSheetOpen}
        categories={categories}
        onSave={onSaveExpense}
        onAddCategory={onAddCategory}
        currencySymbol={currencySymbol}
      />
    </>
  );
}
