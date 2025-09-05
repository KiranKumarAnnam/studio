'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BarChartHorizontalBig, PlusCircle, Trash2, Edit, MoreVertical, X } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Budget, Expense } from '@/lib/types';

interface BudgetGoalsProps {
    budgets: Budget[];
    expenses: Expense[];
    categories: string[];
    onSaveBudget: (budget: Budget) => void;
    onDeleteBudget: (category: string) => void;
    currencyFormatter: (amount: number) => string;
    currencySymbol: string;
    currencyRate: number;
}

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  limit: z.coerce.number().positive('Limit must be a positive number.'),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export function BudgetGoals({ budgets, expenses, categories, onSaveBudget, onDeleteBudget, currencyFormatter, currencySymbol, currencyRate }: BudgetGoalsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
    });
    
    const openDialog = (budget?: Budget) => {
        if (budget) {
            setBudgetToEdit(budget);
            form.reset({
                category: budget.category,
                limit: parseFloat((budget.limit * currencyRate).toFixed(2)),
            });
        } else {
            setBudgetToEdit(null);
            form.reset({ category: '', limit: undefined });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: BudgetFormValues) => {
        onSaveBudget(data);
        setIsDialogOpen(false);
    };

    const spendingByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const unbudgetedCategories = categories.filter(c => !budgets.some(b => b.category === c));

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <BarChartHorizontalBig />
                           Budget Goals
                        </div>
                        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openDialog()}>
                            <PlusCircle className="w-5 h-5"/>
                            <span className="sr-only">Add Budget</span>
                        </Button>
                    </CardTitle>
                    <CardDescription>Track your monthly spending against your budget goals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {budgets.length > 0 ? (
                        budgets.map(budget => {
                            const spent = spendingByCategory[budget.category] || 0;
                            const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                            const remaining = budget.limit - spent;
                            const isOverBudget = remaining < 0;

                            return (
                                <div key={budget.category}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm">{budget.category}</span>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="w-8 h-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => openDialog(budget)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => setBudgetToDelete(budget)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <Progress value={Math.min(progress, 100)} className={isOverBudget ? '[&>div]:bg-destructive' : ''}/>
                                    <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                                        <span>{currencyFormatter(spent)} spent</span>
                                        <span className={isOverBudget ? 'text-destructive font-medium' : ''}>
                                            {isOverBudget ? `${currencyFormatter(Math.abs(remaining))} over` : `${currencyFormatter(remaining)} left`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg">
                            <p className="mb-2">No budgets set yet.</p>
                            <Button size="sm" variant="outline" onClick={() => openDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add a Budget
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{budgetToEdit ? 'Edit' : 'Add'} Budget</DialogTitle>
                        <DialogDescription>
                           Set a monthly spending limit for a category.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!budgetToEdit}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {budgetToEdit && <SelectItem value={budgetToEdit.category}>{budgetToEdit.category}</SelectItem>}
                                                {unbudgetedCategories.map(cat => (
                                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="limit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Limit ({currencySymbol})</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="0.00" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit">Save Budget</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            
            <AlertDialog open={!!budgetToDelete} onOpenChange={(open) => !open && setBudgetToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the budget for "{budgetToDelete?.category}". You can always set a new one later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (budgetToDelete) {
                                    onDeleteBudget(budgetToDelete.category);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}