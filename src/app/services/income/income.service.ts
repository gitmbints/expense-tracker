import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';
import { Income } from '../../models/income';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private supabaseService = inject(SupabaseService);

  private readonly incomes = signal<Income[]>([]);
  private readonly isLoading = signal<boolean>(false);

  // Simplified signal accessors
  incomesList = this.incomes.asReadonly();
  isLoadingState = this.isLoading.asReadonly();

  fetchIncomes$(): Observable<Income[]> {
    this.isLoading.set(true);
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .select(`id, name, amount, date`),
    ).pipe(
      map(this.processResponse<Income>),
      tap((data) => {
        this.incomes.set(data);
        this.isLoading.set(false);
      }),
      catchError(this.processError),
    );
  }

  createIncome$(income: Omit<Income, 'id'>): Observable<Income[]> {
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .insert({
          name: income.name,
          amount: income.amount,
          date: income.date,
        })
        .select(),
    ).pipe(
      map(this.processResponse<Income>),
      tap((data) => {
        if (data.length > 0) {
          this.incomes.update((incomes) => [...incomes, data[0]]);
        }
      }),
      catchError(this.processError),
    );
  }

  editIncome$(
    id: string | undefined,
    newIncome: Omit<Income, 'id'>,
  ): Observable<Income[]> {
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .update({
          name: newIncome.name,
          amount: newIncome.amount,
          date: newIncome.date,
        })
        .eq('id', id)
        .select(),
    ).pipe(
      map(this.processResponse<Income>),
      tap((data) => {
        if (data.length > 0) {
          this.incomes.update((incomes) => {
            return incomes.map((income) =>
              income.id === id ? { ...data[0], id } : income,
            );
          });
        }
      }),
      catchError(this.processError),
    );
  }

  removeIncome$(id: string): Observable<Income[]> {
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(
      map(this.processResponse<Income>),
      tap((data) => {
        if (data.length > 0) {
          this.incomes.update((incomes) => {
            return incomes.filter((income) => income.id !== id);
          });
        }
      }),
      catchError(this.processError),
    );
  }

  readonly totalIncome: Signal<number> = computed(() => {
    return this.incomes().reduce((total, income) => total + income.amount, 0);
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
