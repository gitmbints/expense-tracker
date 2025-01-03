import {
  Component,
  computed,
  DestroyRef,
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
export class DashboardComponent implements OnInit {
  readonly title: string = 'Dashboard';
  readonly totalIncome: Signal<number>;
  readonly totalExpense: Signal<number>;
  readonly remaining: Signal<number>;
  readonly isLoading: Signal<boolean>;

  @ViewChild('chart', { static: false }) chart!: ChartComponent;
  public chartOptions: ChartOptions;

  incomeService: IncomeService = inject(IncomeService);
  expenseService: ExpenseService = inject(ExpenseService);
  destroyRef = inject(DestroyRef);

  expensesByCategory: Signal<{ category: Category; total: number }[]> =
    inject(ExpenseService).getExpensesByCategory();
  expensesByCategory$ = toObservable(this.expensesByCategory);

  constructor() {
    this.totalIncome = this.incomeService.totalIncome;
    this.totalExpense = this.expenseService.totalExpense;
    this.remaining = this.calculateRemaining();
    this.chartOptions = this.initializeChartOptions();
    this.isLoading = this.expenseService.getIsLoading();
  }

  ngOnInit(): void {
    this.expensesByCategory$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
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
