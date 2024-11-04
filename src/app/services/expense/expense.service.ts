import { inject, Injectable, Signal, signal } from '@angular/core';
import { Expense } from '../../model/expense';
import { SupabaseService } from '../supabase.service';
import { catchError, EMPTY, from, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly expenses = signal<Expense[]>([]);

  getExpenseList(): Signal<Expense[]> {
    return this.expenses.asReadonly();
  }

  private supabaseService: SupabaseService = inject(SupabaseService);

  constructor() {
    this.loadExpenses();
  }

  // Observable-based fetching function with RxJS operators
  private fetchExpenses$(): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .select('*')
        .returns<Expense[]>(),
    ).pipe(
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

  private createExpense$(expense: Omit<Expense, 'id'>): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase.from('expenses').insert(expense).select(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data as unknown as Expense[]) || [];
      }),
      catchError((err) => {
        console.error('Failed to insert expense: ', err.message);
        return EMPTY;
      }),
    );
  }

  private editExpense$(
    id: string,
    newExpense: Omit<Expense, 'id'>,
  ): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .update(newExpense)
        .eq('id', id)
        .select(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data as unknown as Expense[]) || [];
      }),
      catchError((err) => {
        console.error('Failed to update expense: ', err.message);
        return EMPTY;
      }),
    );
  }

  private removeExpense$(id: string): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data as unknown as Expense[]) || [];
      }),
      catchError((err) => {
        console.error('Failed to update expense: ', err.message);
        return EMPTY;
      }),
    );
  }

  // Load expenses and update the signal with data
  private loadExpenses(): void {
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
    this.createExpense$(expense)
      .pipe(
        tap((data) => {
          if (data.length > 0) {
            this.expenses.update((expenses) => [...expenses, data[0]]);
          }
        }),
      )
      .subscribe();
  }

  updateExpense(id: string | undefined, newExpense: Omit<Expense, 'id'>): void {
    if (id) {
      this.editExpense$(id, newExpense)
        .pipe(
          tap((data) => {
            if (data.length > 0) {
              this.expenses.update((expenses) => {
                return expenses.map((expense) =>
                  expense.id === id ? { ...data[0], id } : expense,
                );
              });
            }
          }),
        )
        .subscribe();
    }
  }

  deleteExpense(id: string): void {
    this.removeExpense$(id)
      .pipe(
        tap((data) => {
          if (data.length > 0) {
            this.expenses.update((expenses) => {
              return expenses.filter((expense) => expense.id !== id);
            });
          }
        }),
      )
      .subscribe();
  }
}
