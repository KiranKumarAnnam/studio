'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getCategorySuggestions } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { Expense } from '@/lib/types';

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required.'),
  amount: z.coerce.number().positive('Amount must be positive.'),
  date: z.date({ required_error: 'Date is required.' }),
  category: z.string().min(1, 'Category is required.'),
  isRecurring: z.boolean().default(false),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface AddExpenseSheetProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: string[];
  onSave: (expense: Omit<Expense, 'id'>) => void;
  onAddCategory: (category: string) => boolean;
  currencySymbol: string;
}

export function AddExpenseSheet({ isOpen, setIsOpen, categories, onSave, onAddCategory, currencySymbol }: AddExpenseSheetProps) {
  const { toast } = useToast();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: undefined,
      date: new Date(),
      category: '',
      isRecurring: false,
    },
  });

  const descriptionValue = form.watch('description');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!isOpen) {
      form.reset({
        description: '',
        amount: undefined,
        date: new Date(),
        category: '',
        isRecurring: false,
      });
      setSuggestions([]);
    }
  }, [isOpen, form]);
  
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (descriptionValue.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSuggesting(true);
      const result = await getCategorySuggestions(descriptionValue);
      setSuggestions(result);
      setIsSuggesting(false);
    }, 500);

    return () => clearTimeout(handler);
  }, [descriptionValue]);


  const handleAddNewCategory = () => {
    if (newCategory) {
      const success = onAddCategory(newCategory);
      if (success) {
        form.setValue('category', newCategory, { shouldValidate: true });
        toast({ title: 'Category added', description: `"${newCategory}" has been added to your categories.` });
        setNewCategory('');
      } else {
        toast({ variant: 'destructive', title: 'Category exists', description: `"${newCategory}" already exists.` });
      }
    }
  };
  
  const onSubmit = (data: ExpenseFormValues) => {
    onSave(data);
    toast({ title: 'Expense Added!', description: 'Your expense has been successfully recorded.' });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Expense</SheetTitle>
          <SheetDescription>Fill in the details for your new expense.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee with a friend" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({currencySymbol})</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.00" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel className="mb-1.5">Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {(isSuggesting || suggestions.length > 0) && (
              <div className="space-y-2 p-3 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>AI Suggestions</span>
                    {isSuggesting && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map(s => (
                            <Button key={s} type="button" variant="outline" size="sm" onClick={() => form.setValue('category', s, { shouldValidate: true })}>
                                {s}
                            </Button>
                        ))}
                    </div>
                )}
              </div>
            )}
            
            <div className="space-y-2 pt-2">
              <FormLabel>Or add a new category</FormLabel>
              <div className="flex gap-2">
                  <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g., Subscriptions"/>
                  <Button type="button" variant="outline" size="icon" onClick={handleAddNewCategory} disabled={!newCategory.trim()}>
                    <PlusCircle className="h-4 w-4"/>
                    <span className="sr-only">Add Category</span>
                  </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Recurring Expense</FormLabel>
                    <p className="text-sm text-muted-foreground">Is this a monthly or yearly bill?</p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
               <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Expense
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
