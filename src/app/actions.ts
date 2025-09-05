'use server';

import { suggestExpenseCategories } from '@/ai/flows/suggest-expense-categories';

export async function getCategorySuggestions(description: string): Promise<string[]> {
  if (!description.trim() || description.trim().length < 3) {
    return [];
  }
  try {
    const result = await suggestExpenseCategories({ description });
    return result.categories;
  } catch (error) {
    console.error('Error getting category suggestions:', error);
    // Fail silently on the UI
    return [];
  }
}
