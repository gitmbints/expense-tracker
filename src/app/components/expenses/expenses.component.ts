import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import { ExpensesFormComponent } from './expenses-form/expenses-form.component';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ExpensesFormComponent, DatePipe],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  readonly title: string = 'Dépenses';
  readonly expenseList: Signal<Expense[]>;
  selectedExpense: Expense | null = null;
  readonly isAddForm = signal<boolean>(true);
  readonly isShowModal = signal<boolean>(false);

  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
  }

  onAddExpense(): void {
    this.openModal(true, null);
  }

  onEditExpense(expense: Expense) {
    this.openModal(false, expense);
  }

  onDeleteExpense(id: string) {
    this.expenseService.deleteExpense(id);
  }

  onCloseModal(): void {
    this.isShowModal.set(false);
  }

  private openModal(isAddForm: boolean, expense: Expense | null): void {
    this.isShowModal.set(true);
    this.isAddForm.set(isAddForm);
    this.selectedExpense = expense;
  }
}
