import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Invest } from '../../models/invest.model';
import { SupabaseService } from '../supabase.service';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InvestmentsService {
  private readonly investments = signal<Invest[]>([]);
  private readonly isLoading = signal<boolean>(false);

  investmentsList = this.investments.asReadonly();
  isLoadingState = this.isLoading.asReadonly();

  private supabaseService = inject(SupabaseService);

  constructor() {
    this.loadInvestments();
  }

  readonly totalInvestments: Signal<number> = computed(() => {
    return this.investments().reduce(
      (total, invest) => total + invest.amount,
      0,
    );
  });

  private fetchInvestments$(): Observable<Invest[]> {
    return from(
      this.supabaseService.supabase
        .from('investments')
        .select(`id, name, amount, date`),
    ).pipe(map(this.processResponse<Invest>), catchError(this.processError));
  }

  private loadInvestments(): void {
    this.isLoading.set(true);

    this.fetchInvestments$()
      .pipe(
        tap((data) => {
          this.investments.set(data);
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
