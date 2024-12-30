import { Component, computed, inject, Signal, ViewChild } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { ExpenseService } from '../../services/expense/expense.service';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { Category } from '../../models/expense';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  readonly title: string = 'Dashboard';
  readonly totalIncome: Signal<number>;
  readonly totalExpense: Signal<number>;
  readonly remaining: Signal<number>;
  readonly expenseCategoryList: Signal<Category[]>;

  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions: ChartOptions;

  incomeService: IncomeService = inject(IncomeService);
  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.totalIncome = this.incomeService.totalIncome;
    this.totalExpense = this.expenseService.totalExpense;
    this.remaining = this.calculateRemaining();
    this.expenseCategoryList = this.expenseService.getCategoryList();
    this.chartOptions = this.initializeChartOptions();

    // Update chart series with expenses by category
    this.updateChartSeries();
  }

  private calculateRemaining(): Signal<number> {
    return computed(() => this.totalIncome() - this.totalExpense());
  }

  private updateChartSeries(): void {
    const expensesByCategory = this.expenseService.getExpensesByCategory();
    const data = expensesByCategory();
    this.chartOptions.series = data.map(
      (categoryExpense) => categoryExpense.total,
    );
    this.chartOptions.labels = data.map(
      (categoryExpense) => categoryExpense.category.name,
    );
  }

  private initializeChartOptions(): ChartOptions {
    return {
      series: [],
      chart: {
        width: 480,
        type: 'pie',
      },
      labels: [],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  // TODO: Calculate total amount of expenses per category
}
