import { Component, inject, signal, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../models/expense';
import { ExpensesFormComponent } from './expenses-form/expenses-form.component';
import { DatePipe } from '@angular/common';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    ExpensesFormComponent,
    DatePipe,
    ModalDeleteComponent,
    LoaderSpinnerComponent,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  readonly title: string = 'Dépenses';
  readonly expenseList: Signal<Expense[]>;
  readonly isAddForm = signal<boolean>(true);
  readonly isShowModal = signal<boolean>(false);
  readonly isLoading: Signal<boolean>;
  readonly isShowModalDelete = signal<boolean>(false);
  readonly totalExpense: Signal<number>;

  selectedExpense: Expense | null = null;
  expenseId!: string;

  private expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
    this.isLoading = this.expenseService.getIsLoading();
    this.totalExpense = this.expenseService.totalExpense;
  }

  onAddExpense(): void {
    this.openModal(true, null);
  }

  onEditExpense(expense: Expense) {
    this.openModal(false, expense);
  }

  onDeleteExpense(id: string) {
    this.isShowModalDelete.set(true);
    this.expenseId = id;
  }

  onCloseModal(): void {
    this.isShowModal.set(false);
  }

  onCloseModalDelete(): void {
    this.isShowModalDelete.set(false);
  }

  private openModal(isAddForm: boolean, expense: Expense | null): void {
    this.isShowModal.set(true);
    this.isAddForm.set(isAddForm);
    this.selectedExpense = expense;
  }
}
