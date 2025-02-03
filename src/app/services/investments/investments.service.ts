import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Invest } from '../../models/invest.model';
import { SupabaseService } from '../supabase/supabase.service';
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

  private createInvest$(income: Omit<Invest, 'id'>): Observable<Invest[]> {
    return from(
      this.supabaseService.supabase
        .from('investments')
        .insert({
          name: income.name,
          amount: income.amount,
          date: income.date,
        })
        .select(),
    ).pipe(map(this.processResponse<Invest>), catchError(this.processError));
  }

  addInvest(invest: Omit<Invest, 'id'>): void {
    this.createInvest$(invest)
      .pipe(
        tap((data) => {
          if (data.length > 0) {
            this.investments.update((investments) => [...investments, data[0]]);
          }
        }),
      )
      .subscribe();
  }

  private editInvest$(
    id: string,
    newInvest: Omit<Invest, 'id'>,
  ): Observable<Invest[]> {
    return from(
      this.supabaseService.supabase
        .from('investments')
        .update({
          name: newInvest.name,
          amount: newInvest.amount,
          date: newInvest.date,
        })
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse<Invest>), catchError(this.processError));
  }

  updateInvest(id: string | undefined, newInvest: Omit<Invest, 'id'>): void {
    if (id) {
      this.editInvest$(id, newInvest)
        .pipe(
          tap((data) => {
            if (data.length > 0) {
              this.investments.update((investments) => {
                return investments.map((invest) =>
                  invest.id === id ? { ...data[0], id } : invest,
                );
              });
            }
          }),
        )
        .subscribe();
    }
  }

  private removeInvest$(id: string): Observable<Invest[]> {
    return from(
      this.supabaseService.supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse<Invest>), catchError(this.processError));
  }

  deleteInvest(id: string): void {
    this.removeInvest$(id)
      .pipe(
        tap((data) => {
          if (data.length > 0) {
            this.investments.update((investments) => {
              return investments.filter((invest) => invest.id !== id);
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
