import { NgOptimizedImage } from '@angular/common';
import { Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { User } from '@supabase/supabase-js';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  router = inject(Router);
  private authService = inject(AuthService);
  user: Signal<User | null> = toSignal(this.authService.user$, {
    initialValue: null,
  });

  constructor() {
    console.log(this.user());
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/auth']);
  }
}
