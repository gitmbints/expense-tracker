import { inject, Injectable, Signal, signal } from '@angular/core';
import { Category, Expense } from '../../models/expense';
import { SupabaseService } from '../supabase.service';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';

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

  private supabaseService: SupabaseService = inject(SupabaseService);

  constructor() {
    this.loadExpenses();
    this.loadCategoryList();
  }

  // Observable-based fetching function with RxJS operators
  private fetchExpenses$(): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase.from('expenses').select('*'),
    ).pipe(map(this.processResponse), catchError(this.processError));
  }

  private createExpense$(expense: Omit<Expense, 'id'>): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase.from('expenses').insert(expense).select(),
    ).pipe(map(this.processResponse), catchError(this.processError));
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
    ).pipe(map(this.processResponse), catchError(this.processError));
  }

  private removeExpense$(id: string): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse), catchError(this.processError));
  }

  private fetchCategoryList$(): Observable<Category[]> {
    return from(
      this.supabaseService.supabase.from('categories').select('*'),
    ).pipe(
      map((response: { data: any; error: any }): Category[] => {
        const { data, error } = response;

        if (error) {
          throw new Error(
            `Something on the request went wrong: ${response.error.message}`,
          );
        }
        return (data as Category[]) || [];
      }),
      catchError((err: any): Observable<never> => {
        console.error('Failed to process the response: ', err.message);
        this.isLoading.set(false);
        return EMPTY;
      }),
    );
  }

  private processResponse(response: { data: any; error: any }): Expense[] {
    const { data, error } = response;

    if (error) {
      throw new Error(
        `Something on the request went wrong: ${response.error.message}`,
      );
    }
    return (data as Expense[]) || [];
  }

  private processError(err: any): Observable<never> {
    console.error('Failed to process the response: ', err.message);
    this.isLoading.set(false);
    return EMPTY;
  }

  // Load expenses and update the signal with data
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
