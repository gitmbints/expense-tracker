export type Expense = {
  id: string;
  name: string;
  amount: number;
  categories: Array<Category>;
  date: string;
};

export type Category = {
  id: string;
  name: string;
};
