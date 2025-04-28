import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';
import { Saving } from './saving.model';
import { SavingsFormComponent } from './savings-form/savings-form.component';
import { SavingsService } from './savings.service';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [
    LoaderSpinnerComponent,
    DatePipe,
    SavingsFormComponent,
    ModalDeleteComponent,
  ],
  templateUrl: './savings.component.html',
})
export class SavingsComponent implements OnInit {
  private savingsService = inject(SavingsService);
  protected readonly destroy = inject(DestroyRef);

  readonly savingList = this.savingsService.savingList;
  readonly isLoading = this.savingsService.isLoadingState;
  readonly totalSavings = this.savingsService.totalSaving;

  isAddForm = signal<boolean>(true);
  isShowModalForm = signal<boolean>(false);
  selectedSaving: Saving | null = null;
  isShowModalDelete = signal<boolean>(false);
  savingId!: string;

  ngOnInit(): void {
    this.loadSavings();
  }

  private loadSavings(): void {
    this.savingsService
      .fetchSavings$()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          console.log('Saving loaded successfully!');
        },
        error: () => {
          console.log('Loading saving failed!');
        },
      });
  }

  onAddSaving(): void {
    this.openModalForm(true, null);
  }

  onEditSaving(saving: Saving): void {
    this.openModalForm(false, saving);
  }

  onDeleteSaving(id: string): void {
    this.isShowModalDelete.set(true);
    this.savingId = id;
  }

  onCloseModalForm(): void {
    this.isShowModalForm.set(false);
  }

  onCloseModalDelete(): void {
    this.isShowModalDelete.set(false);
  }

  private openModalForm(isAddForm: boolean, saving: Saving | null): void {
    this.isShowModalForm.set(true);
    this.isAddForm.set(isAddForm);
    this.selectedSaving = saving;
  }
}
