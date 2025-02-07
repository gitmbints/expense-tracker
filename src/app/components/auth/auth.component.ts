import { Component, inject } from "@angular/core";
import { AuthService } from "../../services/auth/auth.service";

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [],
  templateUrl: './auth.component.html',
  styles: ``
})
export class AuthComponent {
  private authService = inject(AuthService);

  login(): void {
    this.authService.signInWithGoogle();
  }
}
