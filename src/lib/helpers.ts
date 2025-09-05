
import type { Expense } from './types';

export function formatCurrency(amount: number, currency = 'USD', symbol?: string) {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol'
  };

  const formatter = new Intl.NumberFormat('en-US', options);
  let formatted = formatter.format(amount);

  const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'INR': '₹',
      'EUR': '€',
  };

  const targetSymbol = symbol || currencySymbols[currency as keyof typeof currencySymbols] || currency;
  
  const defaultSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'symbol' }).format(0).replace(/[0-9.,\s]/g, '');

  // For some currencies, the symbol is not the default. We need to replace it.
  if (targetSymbol !== defaultSymbol) {
    formatted = formatted.replace(defaultSymbol, targetSymbol);
  }

  // A specific fix for INR which sometimes formats as "INR" instead of "₹"
  if (currency === 'INR') {
    return formatted.replace(/INR/g, '₹');
  }

  return formatted;
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
