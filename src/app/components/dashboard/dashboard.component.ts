import { Component, computed, inject, Signal, ViewChild } from '@angular/core';
import { IncomeService } from '../../services/income/income.service';
import { ExpenseService } from '../../services/expense/expense.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
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

    this.chartOptions = {
      series: [
        {
          name: 'My-series',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chart: {
        width: 350,
        height: 350,
        type: 'bar',
      },
      title: {
        text: 'My First Angular Chart',
      },
      xaxis: {
        categories: [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
        ],
      },
    };
  }
}
