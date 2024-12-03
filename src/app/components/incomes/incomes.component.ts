import { Component, inject, signal, Signal } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { Income } from '../../models/income';
import { DatePipe } from '@angular/common';
import { IncomesFormComponent } from './incomes-form/incomes-form.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [DatePipe, IncomesFormComponent, ModalDeleteComponent],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css',
})
export class IncomesComponent {
  readonly title: string = 'Revenus';
  readonly incomeList: Signal<Income[]>;
  readonly isLoading: Signal<boolean>;
  readonly isAddForm = signal<boolean>(true);
  readonly isShowModal = signal<boolean>(false);
  readonly isShowModalDelete = signal<boolean>(false);
  readonly totalIncome: Signal<number>;

  incomeId!: string;
  selectedIncome: Income | null = null;

  private incomeService: IncomeService = inject(IncomeService);

  constructor() {
    this.incomeList = this.incomeService.getIncomeList();
    this.isLoading = this.incomeService.getIsLoading();
    this.totalIncome = this.incomeService.totalIncome;
  }

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
