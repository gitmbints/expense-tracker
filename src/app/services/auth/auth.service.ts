import { inject, Injectable } from "@angular/core";
import { SupabaseService } from "../supabase/supabase.service";
import { User } from "@supabase/supabase-js";
import { BehaviorSubject } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    this.supabaseService.supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        this.userSubject.next(session.user);
      } else {
        this.userSubject.next(null);
      }
    })
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabaseService.supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: environment.redirectUrl,
      }
    });

    if (error) {
      console.error('Error signing in: ', error.message);
    } else {
      console.log('data: ', data);
    }
  }

  async signOut() {
    const { error } = await this.supabaseService.supabase.auth.signOut();

    if (error) {
      console.error('Error signing out: ', error.message);
    } else {
      this.userSubject.next(null);
    }
  }

}
