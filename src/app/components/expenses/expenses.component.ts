import { Component } from '@angular/core';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  title: string = 'Dépenses';

  isShow: boolean = false;

  toggleModal(): void {
    this.isShow = !this.isShow;
  }
}
