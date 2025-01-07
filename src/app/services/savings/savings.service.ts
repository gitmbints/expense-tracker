import { inject, Injectable, Signal, signal } from '@angular/core';
import { Saving } from '../../models/saving';
import { SupabaseService } from '../supabase.service';
import {
  asyncScheduler,
  catchError,
  EMPTY,
  from,
  map,
  Observable,
  tap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  private readonly savings = signal<Saving[]>([]);

  private supabaseService = inject(SupabaseService);

  constructor() {
    this.loadSavings();
  }

  savingList(): Signal<Saving[]> {
    return this.savings.asReadonly();
  }

  private fetchSavings$(): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .select(`id, created_at, amount`),
    ).pipe(map(this.processResponse<Saving>), catchError(this.processError));
  }

  private loadSavings(): void {
    this.fetchSavings$().pipe(
      tap((data) => {
        this.savings.set(data);
      }),
    );
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
    // this.isLoading.set(false);
    return EMPTY;
  }
}
