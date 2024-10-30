import { inject, Injectable, Signal, signal } from '@angular/core';
import { Expense } from '../../model/expense';
import { SupabaseService } from '../supabase.service';
import { catchError, from, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly expenses = signal<Expense[]>([]);

  getExpenseList(): Signal<Expense[]> {
    return this.expenses.asReadonly();
  }

  private supabase: SupabaseService = inject(SupabaseService);

  constructor() {
    this.loadExpenses();
  }

  // Observable-based fetching function with RxJS operators
  private fetchExpenses$(): Observable<Expense[]> {
    return from(this.supabase.fetchExpenses()).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }),
      catchError((err) => {
        console.error('Failed to fetch expenses: ', err.message);
        return of([]);
      }),
    );
  }

  // Load expenses and update the signal with data
  private loadExpenses() {
    this.fetchExpenses$()
      .pipe(tap((data) => this.expenses.set(data)))
      .subscribe();
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
