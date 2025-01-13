import { Component, inject, input, output } from '@angular/core';
import { ModalDeleteBaseComponent } from '../../ui/modal-delete-base/modal-delete-base.component';
import { SavingsService } from '../../../services/savings/savings.service';

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [ModalDeleteBaseComponent],
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {
  readonly closeModal = output<void>();
  readonly id = input.required<string>();

  private savingsService = inject(SavingsService);

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.savingsService.deleteSaving(this.id());
    this.closeModal.emit();
  }
}
