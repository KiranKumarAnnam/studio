
import type { Expense } from './types';

export function formatCurrency(amount: number, currency = 'USD', symbol?: string) {
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: currency,
  };

  if (symbol) {
    options.currencyDisplay = 'symbol';
  } else {
    options.currencyDisplay = 'code';
  }

  const formatter = new Intl.NumberFormat('en-US', options);
  let formatted = formatter.format(amount);

  const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'INR': '₹',
      'EUR': '€',
  };
  
  const targetSymbol = symbol || currencySymbols[currency as keyof typeof currencySymbols] || currency;

  if (symbol) {
      const codeSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'code' }).format(0).replace(/[0-9.,\s]/g, '');
      const nameSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'name' }).format(0).replace(/[0-9.,\s]/g, '');
      const narrowSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(0).replace(/[0-9.,\s]/g, '');
      const defaultSymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'symbol' }).format(0).replace(/[0-9.,\s]/g, '');
      
      const symbolsToReplace = [codeSymbol, nameSymbol, narrowSymbol, defaultSymbol, currency];
      const uniqueSymbols = [...new Set(symbolsToReplace)];

      for (const s of uniqueSymbols) {
        if (formatted.includes(s)) {
          formatted = formatted.replace(s, targetSymbol);
          break;
        }
      }
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
