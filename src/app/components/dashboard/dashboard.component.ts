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
  title: string = 'Dashboard';
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
    this.remaining = computed(() => {
      return this.totalIncome() - this.totalExpense();
    });
    this.expenseCategoryList = this.expenseService.getCategoryList();

    this.chartOptions = {
      series: [44, 55, 13, 43, 22],
      chart: {
        width: 480,
        type: 'pie',
      },
      labels: this.expenseCategoryList().map((category) => category.name),
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
}
