import {
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ChartComponent,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { forkJoin } from 'rxjs';
import { Category } from '../../models/expense';
import { ExpenseService } from '../../services/expense/expense.service';
import { IncomeService } from '../../services/income/income.service';
import { InvestmentsService } from '../../services/investments/investments.service';
import { SavingsService } from '../../services/savings/savings.service';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';

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
  readonly incomeService = inject(IncomeService);
  readonly expenseService = inject(ExpenseService);
  readonly investmentsService = inject(InvestmentsService);
  readonly savingsService = inject(SavingsService);

  readonly totalIncome = this.incomeService.totalIncome;
  readonly totalExpense = this.expenseService.totalExpense;
  readonly remaining = this.calculateRemaining();
  readonly isLoading = this.expenseService.isLoadingState;
  readonly totalInvestments = this.investmentsService.totalInvestments;
  readonly totalSavings = this.savingsService.totalSaving;

  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions: ChartOptions;

  expensesByCategory: Signal<{ category: Category; total: number }[]> =
    inject(ExpenseService).getExpensesByCategory();
  expensesByCategory$ = toObservable(this.expensesByCategory).pipe(
    takeUntilDestroyed(),
  );

  constructor() {
    this.chartOptions = this.initializeChartOptions();
  }

  ngOnInit(): void {
    // Fetch initial data
    forkJoin([
      this.expenseService.fetchExpenses$(),
      this.expenseService.fetchCategoryList$(),
      this.incomeService.fetchIncomes$(),
      this.investmentsService.fetchInvestments$(),
      this.savingsService.fetchSavings$(),
    ]).subscribe();

    // Update chart data
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
