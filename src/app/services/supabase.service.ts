import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';
import { Database } from '../utils/database.types';
import { Observable } from 'rxjs';

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
}
