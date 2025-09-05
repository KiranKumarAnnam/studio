import type { Expense } from './types';

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function exportToCsv(expenses: Expense[], fileName: string) {
  if (typeof window === 'undefined') return;

  const headers = ['ID', 'Date', 'Description', 'Amount', 'Category'];
  const csvRows = [
    headers.join(','),
    ...expenses.map(expense =>
      [
        expense.id,
        expense.date.toISOString().split('T')[0],
        `"${expense.description.replace(/"/g, '""')}"`,
        expense.amount,
        expense.category,
      ].join(',')
    ),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
