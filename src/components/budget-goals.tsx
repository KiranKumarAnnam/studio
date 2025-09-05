'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { BarChartHorizontalBig, PlusCircle, Trash2, Edit, MoreVertical } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Budget, Expense } from '@/lib/types';

interface BudgetGoalsProps {
    budgets: Budget[];
    monthlyExpenses: Expense[];
    yearlyExpenses: Expense[];
    categories: string[];
    onSaveBudget: (budget: Omit<Budget, 'id'>) => void;
    onDeleteBudget: (category: string, period: 'monthly' | 'yearly') => void;
    currencyFormatter: (amount: number) => string;
    currencySymbol: string;
    currencyRate: number;
}

const budgetSchema = z.object({
  category: z.string().min(1, 'Category is required.'),
  limit: z.coerce.number().positive('Limit must be a positive number.'),
  period: z.enum(['monthly', 'yearly']),
});

type BudgetFormValues = z.infer<typeof budgetSchema>;

export function BudgetGoals({ budgets, monthlyExpenses, yearlyExpenses, categories, onSaveBudget, onDeleteBudget, currencyFormatter, currencySymbol, currencyRate }: BudgetGoalsProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
    const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');

    const form = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetSchema),
    });
    
    const openDialog = (budget?: Budget) => {
        if (budget) {
            setBudgetToEdit(budget);
            form.reset({
                category: budget.category,
                limit: parseFloat((budget.limit * currencyRate).toFixed(2)),
                period: budget.period,
            });
        } else {
            setBudgetToEdit(null);
            form.reset({ category: '', limit: undefined, period: activeTab });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = (data: BudgetFormValues) => {
        onSaveBudget(data);
        setIsDialogOpen(false);
    };

    const monthlySpending = monthlyExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const yearlySpending = yearlyExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const monthlyBudgets = budgets.filter(b => b.period === 'monthly');
    const yearlyBudgets = budgets.filter(b => b.period === 'yearly');

    const unbudgetedCategories = (period: 'monthly' | 'yearly') => {
        const existingBudgets = period === 'monthly' ? monthlyBudgets : yearlyBudgets;
        return categories.filter(c => !existingBudgets.some(b => b.category === c));
    }

    const renderBudgetList = (list: Budget[], spending: Record<string, number>) => {
        if (list.length === 0) {
             return (
                <div className="text-center text-muted-foreground py-8 border-dashed border-2 rounded-lg mt-4">
                    <p className="mb-2">No {activeTab} budgets set yet.</p>
                    <Button size="sm" variant="outline" onClick={() => openDialog()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add a Budget
                    </Button>
                </div>
            );
        }

        return (
            <div className="space-y-4 pt-4">
                {list.map(budget => {
                    const spent = spending[budget.category] || 0;
                    const progress = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
                    const remaining = budget.limit - spent;
                    const isOverBudget = remaining < 0;

                    return (
                        <div key={budget.category}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-sm">{budget.category}</span>
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
                })}
            </div>
        );
    }

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
                    <CardDescription>Track your spending against your budget goals.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'monthly' | 'yearly')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="yearly">Yearly</TabsTrigger>
                        </TabsList>
                        <TabsContent value="monthly">
                            {renderBudgetList(monthlyBudgets, monthlySpending)}
                        </TabsContent>
                        <TabsContent value="yearly">
                            {renderBudgetList(yearlyBudgets, yearlySpending)}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{budgetToEdit ? 'Edit' : 'Add'} Budget</DialogTitle>
                        <DialogDescription>
                           Set a spending limit for a category.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="period"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Period</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!!budgetToEdit}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a period" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!!budgetToEdit}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {budgetToEdit && <SelectItem value={budgetToEdit.category}>{budgetToEdit.category}</SelectItem>}
                                                {unbudgetedCategories(form.getValues('period')).map(cat => (
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
                                        <FormLabel>Limit ({currencySymbol})</FormLabel>
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
                            This will remove the {budgetToDelete?.period} budget for "{budgetToDelete?.category}". You can always set a new one later.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (budgetToDelete) {
                                    onDeleteBudget(budgetToDelete.category, budgetToDelete.period);
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
