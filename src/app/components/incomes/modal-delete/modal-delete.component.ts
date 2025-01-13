import { Component, inject, input, output } from '@angular/core';
import { ModalDeleteBaseComponent } from '../../ui/modal-delete-base/modal-delete-base.component';
import { IncomeService } from '../../../services/income/income.service';

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [ModalDeleteBaseComponent],
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {
  readonly closeModal = output<void>();
  readonly id = input.required<string>();

  private incomeService: IncomeService = inject(IncomeService);

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.incomeService.deleteIncome(this.id());
    this.closeModal.emit();
  }
}
