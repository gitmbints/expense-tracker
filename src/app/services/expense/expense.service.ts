import { Injectable, Signal, signal } from '@angular/core';
import * as expensesData from '../../data/expenses.json';
import { Expense, ExpenseWithoutId } from '../../model/expense';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly expenses = signal<Expense[]>(expensesData.data);

  getExpenseList(): Signal<Expense[]> {
    return this.expenses.asReadonly();
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

  addExpense(expense: ExpenseWithoutId): void {
    this.expenses.update((expenses) => [
      ...expenses,
      { ...expense, id: this.generateId() },
    ]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // TODO add new expenses entry into expenses signal
  // TODO modify existing expenses entry from expenses signal
  // TODO delete existing expenses entry from expenses signal
}