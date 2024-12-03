import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Category, Expense } from '../../models/expense';
import { SupabaseService } from '../supabase.service';
import { catchError, EMPTY, from, map, Observable, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly expenses = signal<Expense[]>([]);
  private readonly isLoading = signal(false);
  private readonly categoryList = signal<Category[]>([]);

  getExpenseList(): Signal<Expense[]> {
    return this.expenses.asReadonly();
  }

  getIsLoading(): Signal<boolean> {
    return this.isLoading.asReadonly();
  }

  getCategoryList(): Signal<Category[]> {
    return this.categoryList.asReadonly();
  }

  readonly totalExpense: Signal<number> = computed(() => {
    return this.expenses().reduce(
      (total, expense) => total + expense.amount,
      0,
    );
  });

  private supabaseService: SupabaseService = inject(SupabaseService);

  constructor() {
    this.loadExpenses();
    this.loadCategoryList();
  }

  // Observable-based fetching function with RxJS operators
  private fetchExpenses$(): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .select(`id, name, amount, date, categories (id, name)`),
    ).pipe(map(this.processResponse<Expense>), catchError(this.processError));
  }

  private createExpense$(expense: Omit<Expense, 'id'>): Observable<Expense[]> {
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
        const createdExpense = response.data[0]; // Assumer que `select()` retourne un tableau

        if (!createdExpense) {
          throw new Error('Erreur lors de la création de la dépense');
        }

        const associations = expense.categories.map((category) => ({
          expense_id: createdExpense.id,
          category_id: category.id,
        }));

        return from(
          this.supabaseService.supabase
            .from('expenses_categories')
            .insert(associations),
        ).pipe(
          switchMap(() => {
            return this.supabaseService.supabase
              .from('categories')
              .select('*')
              .in(
                'id',
                associations.map((association) => association.category_id),
              );
          }),
          map((response: { data: any; error: any }) => {
            const categories =
              response.data?.map((res: any) => ({
                id: res.id,
                name: res.name,
              })) || [];

            return [{ ...createdExpense, categories: categories }];
          }),
          catchError(this.processError),
        );
      }),
      catchError(this.processError),
    );
  }

  private editExpense$(
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
        const updatedExpense = response.data[0]; // Assumer que `select()` retourne un tableau

        if (!updatedExpense) {
          throw new Error('Erreur lors de la création de la dépense');
        }

        const associations = newExpense.categories.map((category) => ({
          expense_id: id,
          category_id: category.id,
        }));

        return from(
          this.supabaseService.supabase
            .from('expenses_categories')
            .delete()
            .eq('expense_id', id),
        ).pipe(
          switchMap(() => {
            return this.supabaseService.supabase
              .from('expenses_categories')
              .insert(associations);
          }),
          switchMap(() => {
            return this.supabaseService.supabase
              .from('categories')
              .select('*')
              .in(
                'id',
                associations.map((association) => association.category_id),
              );
          }),
          map((response: { data: any; error: any }) => {
            const categories =
              response.data?.map((res: any) => ({
                id: res.id,
                name: res.name,
              })) || [];

            return [{ ...updatedExpense, categories: categories }];
          }),
          catchError(this.processError),
        );
      }),
      catchError(this.processError),
    );
  }

  private removeExpense$(id: string): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse<Expense>), catchError(this.processError));
  }

  private fetchCategoryList$(): Observable<Category[]> {
    return from(
      this.supabaseService.supabase.from('categories').select('*'),
    ).pipe(map(this.processResponse<Category>), catchError(this.processError));
  }

  private loadExpenses(): void {
    this.isLoading.set(true);
    this.fetchExpenses$()
      .pipe(
        tap((data) => {
          this.expenses.set(data);
          this.isLoading.set(false);
        }),
      )
      .subscribe();
  }

  private loadCategoryList(): void {
    this.fetchCategoryList$()
      .pipe(
        tap((data) => {
          this.categoryList.set(data);
        }),
      )
      .subscribe();
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
