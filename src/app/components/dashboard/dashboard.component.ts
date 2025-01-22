import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  ViewChild,
} from '@angular/core';
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
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { InvestmentsService } from '../../services/investments/investments.service';
import { SavingsService } from '../../services/savings/savings.service';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgApexchartsModule, LoaderSpinnerComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  readonly title: string = 'Dashboard';
  readonly totalIncome: Signal<number>;
  readonly totalExpense: Signal<number>;
  readonly remaining: Signal<number>;
  readonly isLoading: Signal<boolean>;
  readonly totalInvestments: Signal<number>;
  readonly totalSavings: Signal<number>;

  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions: ChartOptions;

  incomeService = inject(IncomeService);
  expenseService = inject(ExpenseService);
  investmentsService = inject(InvestmentsService);
  savingsService = inject(SavingsService);

  expensesByCategory: Signal<{ category: Category; total: number }[]> =
    inject(ExpenseService).getExpensesByCategory();
  expensesByCategory$ = toObservable(this.expensesByCategory).pipe(
    takeUntilDestroyed(),
  );

  constructor() {
    this.totalIncome = this.incomeService.totalIncome;
    this.totalExpense = this.expenseService.totalExpense;
    this.totalInvestments = this.investmentsService.totalInvestments;
    this.totalSavings = this.savingsService.totalSaving;
    this.remaining = this.calculateRemaining();
    this.chartOptions = this.initializeChartOptions();
    this.isLoading = this.expenseService.getIsLoading();
  }

  ngOnInit(): void {
    this.expensesByCategory$.subscribe((data) => {
      this.chartOptions.series = data.map(
        (categoryExpense) => categoryExpense.total,
      );
      this.chartOptions.labels = data.map(
        (categoryExpense) => categoryExpense.category.name,
      );
    });
  }

  private calculateRemaining(): Signal<number> {
    return computed(() => this.totalIncome() - this.totalExpense());
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
}
