
'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { isThisMonth } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Expense } from '@/lib/types';


interface ExpenseChartProps {
    expenses: Expense[];
    currencyFormatter: (amount: number) => string;
}

const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    '#f59e0b',
    '#10b981',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
];


export function ExpenseChart({ expenses, currencyFormatter }: ExpenseChartProps) {
  
  const thisMonthExpenses = expenses.filter(e => isThisMonth(e.date));

  const data = thisMonthExpenses.reduce((acc, expense) => {
    const existingCategory = acc.find(item => item.category === expense.category);
    if (existingCategory) {
      existingCategory.value += expense.amount;
    } else {
      acc.push({ category: expense.category, value: expense.amount });
    }
    return acc;
  }, [] as { category: string; value: number }[]).sort((a,b) => b.value - a.value);

  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.category.toLowerCase()] = {
      label: item.category,
      color: COLORS[index % COLORS.length]
    };
    return acc;
  }, {} as any);

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <TrendingUp />
                Monthly Spending
            </CardTitle>
            <CardDescription>A breakdown of your expenses for the current month.</CardDescription>
        </CardHeader>
        <CardContent>
            {data.length > 0 ? (
                 <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent 
                                hideLabel
                                formatter={(value) => currencyFormatter(value as number)}
                            />}
                        />
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="category"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
                                    {`${(percent * 100).toFixed(0)}%`}
                                </text>
                                );
                            }}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{ right: -20, top: 20, lineHeight: '24px' }}
                            formatter={(value, entry, index) => <span className="text-sm text-foreground">{value}</span>}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                 </ChartContainer>
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <TrendingDown className="mx-auto h-12 w-12" />
                    <p className="mt-4 text-sm">No expenses recorded this month.</p>
                </div>
            )}
      </CardContent>
    </Card>
  );
}
