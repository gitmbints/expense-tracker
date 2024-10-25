import { Component, inject, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import { Flowbite } from '../../flowbite/flowbite';
import { ExpensesFormComponent } from './expenses-form/expenses-form.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ExpensesFormComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
@Flowbite()
export class ExpensesComponent {
  readonly title: string = 'Dépenses';
  readonly expenseList: Signal<Expense[]>;

  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
  }
}
