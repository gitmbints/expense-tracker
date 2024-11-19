import { inject, Injectable, Signal, signal } from '@angular/core';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';
import { Income } from '../../models/income';
import { SupabaseService } from '../supabase.service';

@Injectable({
  providedIn: 'root',
})
export class IncomeService {
  private readonly incomes = signal<Income[]>([]);
  private readonly isLoading = signal(false);

  private supabaseService: SupabaseService = inject(SupabaseService);

  constructor() {
    this.loadIncomes();
  }

  getIncomeList(): Signal<Income[]> {
    return this.incomes.asReadonly();
  }

  getIsLoading(): Signal<boolean> {
    return this.isLoading.asReadonly();
  }

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
        tap((data) => {
          this.incomes.set(data);
          this.isLoading.set(false);
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
