import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../models/expense';
import { ExpensesFormComponent } from './expenses-form/expenses-form.component';
import { DatePipe } from '@angular/common';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    ExpensesFormComponent,
    DatePipe,
    ModalDeleteComponent,
    LoaderSpinnerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './expenses.component.html',
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

  search = new FormControl('', { nonNullable: true });

  private expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
    this.isLoading = this.expenseService.getIsLoading();
    this.totalExpense = this.expenseService.totalExpense;
  }

  searchValue = toSignal(this.search.valueChanges);

  readonly filteredExpenseList: Signal<Expense[]> = computed(() => {
    if (this.searchValue()) {
      const filtered = this.expenseList().filter((expense) => {
        return expense.name
          .toLowerCase()
          .includes(this.searchValue()?.toLowerCase() || '');
      });

      return filtered;
    }

    return this.expenseList();
  });

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
