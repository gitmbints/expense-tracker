import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';
import { Database } from '../utils/database.types';
import { Expense } from '../model/expense';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient<Database>(
      environment.supabaseUrl,
      environment.supabaseKey,
    );
  }

  fetchExpenses() {
    return this.supabase.from('expenses').select('*').returns<Expense[]>();
  }
}