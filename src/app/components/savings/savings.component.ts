import { Component, inject, OnInit, signal, Signal } from '@angular/core';
import { SavingsService } from '../../services/savings/savings.service';
import { Saving } from '../../models/saving';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { DatePipe } from '@angular/common';
import { SavingsFormComponent } from './savings-form/savings-form.component';
import { ModalDeleteComponent } from './modal-delete/modal-delete.component';

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
  title: string = 'Epargnes';

  savingList!: Signal<Saving[]>;
  isLoading!: Signal<boolean>;

  isAddForm = signal<boolean>(true);
  isShowModalForm = signal<boolean>(false);
  selectedSaving: Saving | null = null;
  isShowModalDelete = signal<boolean>(false);
  savingId!: string;

  private savingsService = inject(SavingsService);

  constructor() {}

  ngOnInit(): void {
    this.savingList = this.savingsService.savingList;
    this.isLoading = this.savingsService.isLoadingState;
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
