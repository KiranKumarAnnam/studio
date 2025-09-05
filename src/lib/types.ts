import type { LucideIcon } from 'lucide-react';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string;
  isRecurring?: boolean;
}

export interface SummaryPeriod {
    id: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom_range';
    label: string;
    icon?: LucideIcon;
}

export interface Budget {
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
}
