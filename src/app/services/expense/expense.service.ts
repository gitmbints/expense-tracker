import { inject, Injectable, OnInit, Signal, signal } from '@angular/core';
// import * as expensesData from '../../data/expenses.json';
import { Expense } from '../../model/expense';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  expensesData: Expense[] = [];

  private readonly expenses = signal<Expense[]>(this.expensesData);

  getExpenseList(): Signal<Expense[]> {
    return this.expenses.asReadonly();
  }

  supabase: SupabaseService = inject(SupabaseService);

  constructor() {
    this.fetchExpenseList();
  }

  async fetchExpenseList() {
    try {
      const { data, error } = await this.supabase.fetchExpenses();

      if (data) {
        this.expensesData = data;
        this.expenses.set(data);
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }

  getExpenseCategoryList(): string[] {
    const uniqueCategories = new Set<string>();

    this.expenses().forEach((expense) => {
      expense.category.forEach((category) => {
        uniqueCategories.add(category);
      });
    });

    return Array.from(uniqueCategories);
  }

  addExpense(expense: Omit<Expense, 'id'>): void {
    this.expenses.update((expenses) => [
      ...expenses,
      { ...expense, id: this.generateId() },
    ]);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  }

  updateExpense(id: string | undefined, newExpense: Omit<Expense, 'id'>): void {
    this.expenses.update((expenses) => {
      return expenses.map((expense) =>
        expense.id === id ? { ...newExpense, id } : expense,
      );
    });
  }

  deleteExpense(id: string): void {
    this.expenses.update((expenses) => {
      return expenses.filter((expense) => expense.id !== id);
    });
  }
}
