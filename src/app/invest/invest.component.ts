import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { InvestFormComponent } from './invest-form/invest-form.component';
import { Invest } from './invest.model';
import { InvestmentsService } from './investments.service';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';

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
  protected readonly destroy = inject(DestroyRef);

  readonly investmentsList = this.investmentsService.investmentsList;
  readonly isLoading = this.investmentsService.isLoadingState;
  readonly totalInvestments = this.investmentsService.totalInvestments;

  isAddForm = signal<boolean>(true);
  isShowModalForm = signal<boolean>(false);
  selectedInvest: Invest | null = null;
  isShowModalDelete = signal<boolean>(false);
  investId!: string;

  search = new FormControl('', { nonNullable: true });
  private searchValue = toSignal(this.search.valueChanges);

  ngOnInit(): void {
    this.loadInvestments();
  }

  private loadInvestments(): void {
    this.investmentsService
      .fetchInvestments$()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          console.log('Investment loaded successfully!');
        },
        error: () => {
          console.log('Loading Investments failed!');
        },
      });
  }

  readonly filteredInvestmentsList: Signal<Invest[]> = computed(() => {
    if (this.searchValue()) {
      return this.investmentsList().filter((invest) => {
        return invest.name
          .toLowerCase()
          .includes(this.searchValue()?.toLowerCase() || '');
      });
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
