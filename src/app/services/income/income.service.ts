import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';
import { Income } from '../../models/income';
import { SupabaseService } from '../supabase/supabase.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private supabaseService: SupabaseService = inject(SupabaseService);

  private readonly incomes = signal<Income[]>([]);
  private readonly isLoading = signal(false);

  constructor() {
    this.loadIncomes();
  }

  getIncomeList(): Signal<Income[]> {
    return this.incomes.asReadonly();
  }

  getIsLoading(): Signal<boolean> {
    return this.isLoading.asReadonly();
  }

  readonly totalIncome: Signal<number> = computed(() => {
    return this.incomes().reduce((total, income) => total + income.amount, 0);
  });

  private fetchIncomes$(): Observable<Income[]> {
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .select(`id, name, amount, date`),
    ).pipe(map(this.processResponse<Income>), catchError(this.processError));
  }

  private loadIncomes(): void {
    this.isLoading.set(true);
    this.fetchIncomes$()
      .pipe(
        takeUntilDestroyed(),
        tap((data) => {
          this.incomes.set(data);
          this.isLoading.set(false);
        }),
      )
      .subscribe();
  }

  private createIncome$(income: Omit<Income, 'id'>): Observable<Income[]> {
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .insert({
          name: income.name,
          amount: income.amount,
          date: income.date,
        })
        .select(),
    ).pipe(map(this.processResponse<Income>), catchError(this.processError));
  }

  addIncome(income: Omit<Income, 'id'>): void {
    this.createIncome$(income)
      .pipe(
        takeUntilDestroyed(),
        tap((data) => {
          if (data.length > 0) {
            this.incomes.update((incomes) => [...incomes, data[0]]);
          }
        }),
      )
      .subscribe();
  }

  private editIncome$(
    id: string,
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
    ).pipe(map(this.processResponse<Income>), catchError(this.processError));
  }

  updateIncome(id: string | undefined, newIncome: Omit<Income, 'id'>): void {
    if (id) {
      this.editIncome$(id, newIncome)
        .pipe(
          takeUntilDestroyed(),
          tap((data) => {
            if (data.length > 0) {
              this.incomes.update((incomes) => {
                return incomes.map((income) =>
                  income.id === id ? { ...data[0], id } : income,
                );
              });
            }
          }),
        )
        .subscribe();
    }
  }

  private removeIncome$(id: string): Observable<Income[]> {
    return from(
      this.supabaseService.supabase
        .from('incomes')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse<Income>), catchError(this.processError));
  }

  deleteIncome(id: string): void {
    this.removeIncome$(id)
      .pipe(
        takeUntilDestroyed(),
        tap((data) => {
          if (data.length > 0) {
            this.incomes.update((incomes) => {
              return incomes.filter((income) => income.id !== id);
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
