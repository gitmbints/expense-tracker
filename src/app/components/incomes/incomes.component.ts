import { Component, inject, signal, Signal } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { Income } from '../../models/income';
import { DatePipe } from '@angular/common';
import { IncomesFormComponent } from './incomes-form/incomes-form.component';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [DatePipe, IncomesFormComponent],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css',
})
export class IncomesComponent {
  readonly title: string = 'Revenus';
  readonly incomeList: Signal<Income[]>;
  readonly isLoading: Signal<boolean>;
  readonly isAddForm = signal<boolean>(true);
  readonly isShowModal = signal<boolean>(false);

  private incomeService: IncomeService = inject(IncomeService);

  constructor() {
    this.incomeList = this.incomeService.getIncomeList();
    this.isLoading = this.incomeService.getIsLoading();
  }

  onAddIncome(): void {
    this.openModal(true, null);
  }

  onCloseModal(): void {
    this.isShowModal.set(false);
  }

  private openModal(isAddForm: boolean, income: Income | null): void {
    this.isShowModal.set(true);
    this.isAddForm.set(isAddForm);
  }
}
