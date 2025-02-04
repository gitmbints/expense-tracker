import { Component, inject, Signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { NgOptimizedImage } from "@angular/common";
import { User } from "@supabase/supabase-js";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  router = inject(Router);
  private authService = inject(AuthService);
  user: Signal<User | null> = toSignal(this.authService.user$, { initialValue: null });

  constructor() {
    console.log(this.user());
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/auth']);
  }
}
