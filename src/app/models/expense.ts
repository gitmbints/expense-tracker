export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: Array<Category>;
  date: string;
};

export type Category = {
  id: string;
  name: string;
};
