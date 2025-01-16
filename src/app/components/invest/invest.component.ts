import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { InvestmentsService } from '../../services/investments/investments.service';
import { Invest } from '../../models/invest.model';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { DatePipe } from '@angular/common';
import { InvestFormComponent } from './invest-form/invest-form.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';

@Component({
  selector: 'app-invest',
  standalone: true,
  imports: [
    LoaderSpinnerComponent,
    DatePipe,
    InvestFormComponent,
    ModalDeleteComponent,
  ],
  templateUrl: './invest.component.html',
})
export class InvestComponent implements OnInit {
  title: string = 'Investissements';
  investmentsList!: Signal<Invest[]>;
  isLoading!: Signal<boolean>;
  totalInvestments!: Signal<number>;

  isAddForm = signal<boolean>(true);
  isShowModalForm = signal<boolean>(false);
  selectedInvest: Invest | null = null;
  isShowModalDelete = signal<boolean>(false);
  investId!: string;

  private investmentsService = inject(InvestmentsService);

  ngOnInit(): void {
    this.investmentsList = this.investmentsService.investmentsList;
    this.isLoading = this.investmentsService.isLoadingState;
    this.totalInvestments = this.investmentsService.totalInvestments;
  }

  onAddInvest(): void {
    this.openModalForm(true, null);
  }

  onEditInvest(invest: Invest): void {
    this.openModalForm(false, invest);
  }

  onDeleteInvest(id: string): void {
    this.isShowModalDelete.set(true);
    this.investId = id;
  }

  onCloseModalForm(): void {
    this.isShowModalForm.set(false);
  }

  onCloseModalDelete(): void {
    this.isShowModalDelete.set(false);
  }

  private openModalForm(isAddForm: boolean, invest: Invest | null): void {
    this.isShowModalForm.set(true);
    this.isAddForm.set(isAddForm);
    this.selectedInvest = invest;
  }
}
