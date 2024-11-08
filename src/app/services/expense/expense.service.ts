import { inject, Injectable, Signal, signal } from '@angular/core';
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

  private supabaseService: SupabaseService = inject(SupabaseService);

  constructor() {
    this.loadExpenses();
    this.loadCategoryList();
  }

  // Observable-based fetching function with RxJS operators
  private fetchExpenses$(): Observable<Expense[]> {
    return from(
      this.supabaseService.supabase.from('expenses').select('*'),
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
        const createdExpense = response.data;

        if (!createdExpense) {
          throw new Error('Erreur lors de la création de la dépense');
        }

        if (expense.category.length === 0) {
          // Retourne la dépense créée sans liaison de catégorie
          return from([createdExpense]);
        }

        // Création des relations dépense-catégorie pour la table 'expense_categories'
        const associations = expense.category.map((category) => ({
          expense_id: createdExpense.id,
          category_id: category.id,
        }));

        return from(
          this.supabaseService.supabase
            .from('expenses_categories')
            .insert(associations),
        ).pipe(
          map(() => ({
            ...createdExpense,
            categories: associations.map((assoc) => ({
              id: assoc.category_id,
            })),
          })),
          catchError(this.processError),
        );
      }),
      map(this.processResponse<Expense>),
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
        .update(newExpense)
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse<Expense>), catchError(this.processError));
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
