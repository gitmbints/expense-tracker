import { Component, inject, signal, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import { ExpensesFormComponent } from './expenses-form/expenses-form.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ExpensesFormComponent],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  readonly title: string = 'Dépenses';
  readonly expenseList: Signal<Expense[]>;
  selectedExpense: Expense | null = null;
  isAddForm = signal<boolean>(true);
  isShowModal = signal<boolean>(false);

  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
  }

  onDeleteExpense(id: string) {
    this.expenseService.deleteExpense(id);
  }

  onAddExpense(): void {
    this.isShowModal.set(true);
    this.isAddForm.set(true);
    this.selectedExpense = null;
  }

  onEditExpense(expense: Expense) {
    this.isShowModal.set(true);
    this.isAddForm.set(false);
    this.selectedExpense = expense;
  }

  onCloseModal(): void {
    this.isShowModal.set(false);
  }
}
