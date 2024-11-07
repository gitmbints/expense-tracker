export type Expense = {
  id: string;
  name: string;
  amount: number;
  category: Array<string>;
  date: string;
};

export type Category = {
  id: string;
  name: string;
};
