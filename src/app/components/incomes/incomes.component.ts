import { Component, inject, Signal } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { Income } from '../../models/income';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './incomes.component.html',
  styleUrl: './incomes.component.css',
})
export class IncomesComponent {
  readonly title: string = 'Revenus';
  readonly incomeList: Signal<Income[]>;
  readonly isLoading: Signal<boolean>;

  private incomeService: IncomeService = inject(IncomeService);

  constructor() {
    this.incomeList = this.incomeService.getIncomeList();
    this.isLoading = this.incomeService.getIsLoading();
  }
}
