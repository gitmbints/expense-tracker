import { inject, Injectable, Signal, signal } from '@angular/core';
import { Saving } from '../../models/saving';
import { SupabaseService } from '../supabase.service';
import { catchError, EMPTY, from, map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SavingsService {
  private readonly savings = signal<Saving[]>([]);
  private readonly isLoading = signal<boolean>(false);

  private supabaseService = inject(SupabaseService);

  constructor() {
    this.loadSavings();
  }

  savingList = this.savings.asReadonly();
  isLoadingState = this.isLoading.asReadonly();

  private fetchSavings$(): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .select(`id, created_at, amount`),
    ).pipe(map(this.processResponse<Saving>), catchError(this.processError));
  }

  private loadSavings(): void {
    this.isLoading.set(true);

    this.fetchSavings$()
      .pipe(
        tap((data) => {
          this.savings.set(data);
          this.isLoading.set(false);
        }),
      )
      .subscribe();
  }

  private createSaving$(saving: Omit<Saving, 'id'>): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .insert({
          created_at: saving.created_at,
          amount: saving.amount,
        })
        .select(),
    ).pipe(map(this.processResponse<Saving>), catchError(this.processError));
  }

  private editSaving$(
    id: string,
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
    ).pipe(map(this.processResponse<Saving>), catchError(this.processError));
  }

  private removeSaving$(id: string): Observable<Saving[]> {
    return from(
      this.supabaseService.supabase
        .from('savings')
        .delete()
        .eq('id', id)
        .select(),
    ).pipe(map(this.processResponse<Saving>), catchError(this.processError));
  }

  addSaving(saving: Omit<Saving, 'id'>): void {
    this.createSaving$(saving)
      .pipe(
        tap((data) => {
          if (data.length > 0) {
            this.savings.update((savings) => [...savings, data[0]]);
          }
        }),
      )
      .subscribe();
  }

  updateSaving(id: string | undefined, newSaving: Omit<Saving, 'id'>): void {
    if (id) {
      this.editSaving$(id, newSaving)
        .pipe(
          tap((data) => {
            if (data.length > 0) {
              this.savings.update((savings) => {
                return savings.map((saving) =>
                  saving.id === id ? { ...data[0], id } : saving,
                );
              });
            }
          }),
        )
        .subscribe();
    }
  }

  deleteSaving(id: string): void {
    this.removeSaving$(id)
      .pipe(
        tap((data) => {
          if (data.length > 0) {
            this.savings.update((savings) => {
              return savings.filter((saving) => saving.id !== id);
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
