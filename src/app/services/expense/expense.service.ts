import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, EMPTY, from, map, Observable, switchMap, tap } from 'rxjs';
import { Category, Expense } from '../../models/expense';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private supabaseService = inject(SupabaseService);

  private readonly expenses = signal<Expense[]>([]);
  private readonly isLoading = signal(false);
  private readonly category = signal<Category[]>([]);

  expenseList = this.expenses.asReadonly();
  isLoadingState = this.isLoading.asReadonly();
  categoryList = this.category.asReadonly();

  fetchExpenses$(): Observable<Expense[]> {
    this.isLoading.set(true);
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .select(`id, name, amount, date, categories (id, name)`),
    ).pipe(
      map(this.processResponse<Expense>),
      tap((data) => {
        this.expenses.set(data);
        this.isLoading.set(false);
      }),
      catchError(this.processError),
    );
  }

  createExpense$(expense: Omit<Expense, 'id'>): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .insert({
          name: expense.name,
          amount: expense.amount,
          date: expense.date,
        })
        .select(),
    ).pipe(
      switchMap((response: { data: any; error: any }) => {
        const createdExpense = response.data[0];

        if (!createdExpense) {
          throw new Error('Error creating expense');
        }

        const associations = expense.categories.map((category) => ({
          expense_id: createdExpense.id,
          category_id: category.id,
        }));

        return this.createExpenseCategories$(createdExpense, associations);
      }),
      tap((data) => {
        if (data.length > 0) {
          this.expenses.update((expenses) => [...expenses, data[0]]);
        }
      }),
      catchError(this.processError),
    );
  }

  editExpense$(
    id: string,
    newExpense: Omit<Expense, 'id'>,
  ): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .update({
          name: newExpense.name,
          amount: newExpense.amount,
          date: newExpense.date,
        })
        .eq('id', id)
        .select(),
    ).pipe(
      switchMap((response: { data: any; error: any }) => {
        const updatedExpense = response.data[0];

        if (!updatedExpense) {
          throw new Error('Error updating expense');
        }

        const associations = newExpense.categories.map((category) => ({
          expense_id: id,
          category_id: category.id,
        }));

        return this.updateExpenseCategories$(id, updatedExpense, associations);
      }),
      tap((data) => {
        if (data.length > 0) {
          this.expenses.update((expenses) => {
            return expenses.map((expense) =>
              expense.id === id ? { ...data[0], id } : expense,
            );
          });
        }
      }),
      catchError(this.processError),
    );
  }

  removeExpense$(id: string): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(
      map(this.processResponse<Expense>),
      tap((data) => {
        if (data.length > 0) {
          this.expenses.update((expenses) => {
            return expenses.filter((expense) => expense.id !== id);
          });
        }
      }),
      catchError(this.processError),
    );
  }

  fetchCategoryList$(): Observable<Category[]> {
    return from(
      this.supabaseService.supabase.from('categories').select('*'),
    ).pipe(
      map(this.processResponse<Category>),
      tap((data) => {
        this.category.set(data);
      }),
      catchError(this.processError),
    );
  }

  getExpensesByCategory(): Signal<{ category: Category; total: number }[]> {
    return computed(() => {
      const expenses = this.expenses();
      const categoryTotals = expenses.reduce(
        (totals, expense) => {
          expense.categories.forEach((category) => {
            if (!totals[category.id]) {
              totals[category.id] = 0;
            }
            totals[category.id] += expense.amount;
          });
          return totals;
        },
        {} as { [key: string]: number },
      );

      return Object.entries(categoryTotals).map(([categoryId, total]) => {
        const category = this.categoryList().find(
          (cat) => cat.id === categoryId,
        );

        if (!category) {
          console.warn(`Category with ID ${categoryId} not found.`);
          return { category: { id: categoryId, name: 'Unknown' }, total };
        }

        return { category, total };
      });
    });
  }

  private createExpenseCategories$(
    createdExpense: any,
    associations: any[],
  ): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses_categories')
        .insert(associations),
    ).pipe(
      switchMap(() => this.fetchCategories$(associations)),
      map((categories) => [{ ...createdExpense, categories }]),
      catchError(this.processError),
    );
  }

  private updateExpenseCategories$(
    id: string,
    updatedExpense: any,
    associations: any[],
  ): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses_categories')
        .delete()
        .eq('expense_id', id),
    ).pipe(
      switchMap(() =>
        this.supabaseService.supabase
          .from('expenses_categories')
          .insert(associations),
      ),
      switchMap(() => this.fetchCategories$(associations)),
      map((categories) => [{ ...updatedExpense, categories }]),
      catchError(this.processError),
    );
  }

  private fetchCategories$(associations: any[]): Observable<Category[]> {
    return from(
      this.supabaseService.supabase
        .from('categories')
        .select('*')
        .in(
          'id',
          associations.map((association) => association.category_id),
        ),
    ).pipe(
      map(
        (response: { data: any; error: any }) =>
          response.data?.map((res: any) => ({
            id: res.id,
            name: res.name,
          })) || [],
      ),
    );
  }

  readonly totalExpense: Signal<number> = computed(() => {
    return this.expenses().reduce(
      (total, expense) => total + expense.amount,
      0,
    );
  });

  private processResponse<T>(response: { data: any; error: any }): T[] {
    const { data, error } = response;

    if (error) {
      throw new Error(
        `Something on the request went wrong: ${response.error.message}`,
      );
    }
    return (data as T[]) || [];
  }

  private processError(err: any): Observable<never> {
    console.error('Failed to process the response: ', err.message);
    this.isLoading.set(false);
    return EMPTY;
  }
}
