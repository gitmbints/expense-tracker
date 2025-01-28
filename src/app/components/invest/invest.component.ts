import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { InvestmentsService } from '../../services/investments/investments.service';
import { Invest } from '../../models/invest.model';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { DatePipe } from '@angular/common';
import { InvestFormComponent } from './invest-form/invest-form.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-invest',
  standalone: true,
  imports: [
    LoaderSpinnerComponent,
    DatePipe,
    InvestFormComponent,
    ModalDeleteComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './invest.component.html',
})
export class InvestComponent implements OnInit {
  private investmentsService = inject(InvestmentsService);

  title: string = 'Investissements';
  investmentsList!: Signal<Invest[]>;
  isLoading!: Signal<boolean>;
  totalInvestments!: Signal<number>;

  isAddForm = signal<boolean>(true);
  isShowModalForm = signal<boolean>(false);
  selectedInvest: Invest | null = null;
  isShowModalDelete = signal<boolean>(false);
  investId!: string;

  search = new FormControl('', { nonNullable: true });
  private searchValue = toSignal(this.search.valueChanges);

  ngOnInit(): void {
    this.investmentsList = this.investmentsService.investmentsList;
    this.isLoading = this.investmentsService.isLoadingState;
    this.totalInvestments = this.investmentsService.totalInvestments;
  }

  readonly filteredInvestmentsList: Signal<Invest[]> = computed(() => {
    if (this.searchValue()) {
      const filtered = this.investmentsList().filter((invest) => {
        return invest.name
          .toLowerCase()
          .includes(this.searchValue()?.toLowerCase() || '');
      });

      return filtered;
    }

    return this.investmentsList();
  });

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
