import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Income } from '../../models/income';
import { IncomeService } from '../../services/income/income.service';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { IncomesFormComponent } from './incomes-form/incomes-form.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [
    DatePipe,
    IncomesFormComponent,
    ModalDeleteComponent,
    LoaderSpinnerComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './incomes.component.html',
})
export class IncomesComponent implements OnInit {
  private incomeService = inject(IncomeService);
  protected readonly destroy = inject(DestroyRef);

  readonly incomeList = this.incomeService.incomesList;
  readonly isLoading = this.incomeService.isLoadingState;
  readonly totalIncome = this.incomeService.totalIncome;

  isAddForm = signal<boolean>(true);
  isShowModal = signal<boolean>(false);
  isShowModalDelete = signal<boolean>(false);
  incomeId!: string;
  selectedIncome: Income | null = null;

  search = new FormControl('', { nonNullable: true });
  private searchValue = toSignal(this.search.valueChanges);

  ngOnInit(): void {
    this.loadIncome();
  }

  private loadIncome(): void {
    this.incomeService
      .fetchIncomes$()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          console.log('Income loaded successfully!');
        },
        error: () => {
          console.log('Loading income failed!');
        },
      });
  }

  readonly filteredIncomeList: Signal<Income[]> = computed(() => {
    if (this.searchValue()) {
      const filtered = this.incomeList().filter((income) => {
        return income.name
          .toLowerCase()
          .includes(this.searchValue()?.toLowerCase() || '');
      });

      return filtered;
    }

    return this.incomeList();
  });

  onAddIncome(): void {
    this.openModal(true, null);
  }

  onEditIncome(income: Income): void {
    this.openModal(false, income);
  }

  onDeleteIncome(id: string): void {
    this.isShowModalDelete.set(true);
    this.incomeId = id;
  }

  onCloseModal(): void {
    this.isShowModal.set(false);
  }

  onCloseModalDelete(): void {
    this.isShowModalDelete.set(false);
  }

  private openModal(isAddForm: boolean, income: Income | null): void {
    this.isShowModal.set(true);
    this.isAddForm.set(isAddForm);
    this.selectedIncome = income;
  }
}
