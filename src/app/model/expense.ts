export interface Expense {
  name: string;
  amount: number;
  category: string[];
  date: string; // or Date if you prefer to handle it as a Date object
}
