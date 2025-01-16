import { Component, inject, OnInit, Signal } from '@angular/core';
import { InvestmentsService } from '../../services/investments/investments.service';
import { Invest } from '../../models/invest.model';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-invest',
  standalone: true,
  imports: [LoaderSpinnerComponent, DatePipe],
  templateUrl: './invest.component.html',
})
export class InvestComponent implements OnInit {
  title: string = 'Investissements';
  investmentsList!: Signal<Invest[]>;
  isLoading!: Signal<boolean>;
  totalInvestments!: Signal<number>;

  private investmentsService = inject(InvestmentsService);

  ngOnInit(): void {
    this.investmentsList = this.investmentsService.investmentsList;
    this.isLoading = this.investmentsService.isLoadingState;
    this.totalInvestments = this.investmentsService.totalInvestments;
  }
}
