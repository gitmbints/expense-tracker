import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Saving } from '../../models/saving';
import { SupabaseService } from '../supabase/supabase.service';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  private supabaseService = inject(SupabaseService);

  private readonly savings = signal<Saving[]>([]);
  private readonly isLoading = signal<boolean>(false);

  savingList = this.savings.asReadonly();
  isLoadingState = this.isLoading.asReadonly();

  fetchSavings$(): Observable<Saving[]> {
    this.isLoading.set(true);
    return from(
      this.supabaseService.supabase
        .from('savings')
        .select(`id, created_at, amount`),
    ).pipe(
      map(this.processResponse<Saving>),
      tap((data) => {
        this.savings.set(data);
        this.isLoading.set(false);
      }),
      catchError(this.processError));
  }

  createSaving$(saving: Omit<Saving, 'id'>): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .insert({
          created_at: saving.created_at,
          amount: saving.amount,
        })
        .select(),
    ).pipe(
      map(this.processResponse<Saving>),
      tap((data) => {
        if (data.length > 0) {
          this.savings.update((savings) => [...savings, data[0]]);
        }
      }),
      catchError(this.processError));
  }

  editSaving$(
    id: string | undefined,
    newSaving: Omit<Saving, 'id'>,
  ): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .update({
          created_at: newSaving.created_at,
          amount: newSaving.amount,
        })
        .eq('id', id)
        .select(),
    ).pipe(
      map(this.processResponse<Saving>),
      tap((data) => {
        if (data.length > 0) {
          this.savings.update((savings) => {
            return savings.map((saving) =>
              saving.id === id ? { ...data[0], id } : saving,
            );
          });
        }
      }),
      catchError(this.processError));
  }

  removeSaving$(id: string): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(
      map(this.processResponse<Saving>),
      tap((data) => {
        if (data.length > 0) {
          this.savings.update((savings) => {
            return savings.filter((saving) => saving.id !== id);
          });
        }
      }),
      catchError(this.processError));
  }

  readonly totalSaving: Signal<number> = computed(() => {
    return this.savings().reduce((total, saving) => total + saving.amount, 0);
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
