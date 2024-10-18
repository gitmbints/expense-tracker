export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string[];
  date: string;
}

export type ExpenseWithoutId = Omit<Expense, 'id'>;
