import { Component, computed, DestroyRef, inject, OnInit, signal, Signal } from "@angular/core";
import { ExpenseService } from "../../services/expense/expense.service";
import { Expense } from "../../models/expense";
import { ExpensesFormComponent } from "./expenses-form/expenses-form.component";
import { DatePipe } from "@angular/common";
import { ModalDeleteComponent } from "./modal-delete/modal-delete.component";
import { LoaderSpinnerComponent } from "../ui/loader-spinner/loader-spinner.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";

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
export class ExpensesComponent implements OnInit {
  private expenseService: ExpenseService = inject(ExpenseService);
  protected readonly destroy = inject(DestroyRef);

  readonly expenseList = this.expenseService.expenseList;
  readonly isLoading = this.expenseService.isLoadingState;
  readonly totalExpense = this.expenseService.totalExpense;

  readonly isAddForm = signal<boolean>(true);
  readonly isShowModal = signal<boolean>(false);
  readonly isShowModalDelete = signal<boolean>(false);

  selectedExpense: Expense | null = null;
  expenseId!: string;

  search = new FormControl('', { nonNullable: true });

  private searchValue = toSignal(this.search.valueChanges);

  readonly filteredExpenseList: Signal<Expense[]> = computed(() => {
    if (this.searchValue()) {
      return this.expenseList().filter((expense) => {
        return expense.name
        .toLowerCase()
        .includes(this.searchValue()?.toLowerCase() || '');
      });
    }

    return this.expenseList();
  });

  ngOnInit(): void {
    this.loadExpenses();
  }

  private loadExpenses(): void {
    this.expenseService.fetchExpenses$().pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => { console.log("Expenses loaded successfully!") },
      error: () => { console.log("Loading expenses failed!") }
    })
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
