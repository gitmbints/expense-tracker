import { Component, inject } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  router = inject(Router);

  logout(): void {
    this.router.navigate(['/auth']).then(r => console.log(r));
  }
}
