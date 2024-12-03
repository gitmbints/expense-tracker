import { Component, computed, inject, Signal } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { ExpenseService } from '../../services/expense/expense.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  title: string = 'Dashboard';
  readonly totalIncome: Signal<number>;
  readonly totalExpense: Signal<number>;
  readonly remaining: Signal<number>;

  incomeService: IncomeService = inject(IncomeService);
  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.totalIncome = this.incomeService.totalIncome;
    this.totalExpense = this.expenseService.totalExpense;
    this.remaining = computed(() => {
      return this.totalIncome() - this.totalExpense();
    });
  }
}
