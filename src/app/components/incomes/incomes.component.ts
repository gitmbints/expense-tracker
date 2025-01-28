import { Component, computed, inject, signal, Signal } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { Income } from '../../models/income';
import { DatePipe } from '@angular/common';
import { IncomesFormComponent } from './incomes-form/incomes-form.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

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
export class IncomesComponent {
  private incomeService: IncomeService = inject(IncomeService);

  readonly title: string = 'Revenus';
  readonly incomeList: Signal<Income[]>;
  readonly isLoading: Signal<boolean>;
  readonly isAddForm = signal<boolean>(true);
  readonly isShowModal = signal<boolean>(false);
  readonly isShowModalDelete = signal<boolean>(false);
  readonly totalIncome: Signal<number>;

  incomeId!: string;
  selectedIncome: Income | null = null;

  search = new FormControl('', { nonNullable: true });

  private searchValue = toSignal(this.search.valueChanges);

  constructor() {
    this.incomeList = this.incomeService.getIncomeList();
    this.isLoading = this.incomeService.getIsLoading();
    this.totalIncome = this.incomeService.totalIncome;
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
