import { Component, inject, input, output } from '@angular/core';
import { ExpenseService } from '../../../services/expense/expense.service';
import { ModalDeleteBaseComponent } from '../../ui/modal-delete-base/modal-delete-base.component';

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [ModalDeleteBaseComponent],
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {
  readonly closeModal = output<void>();
  readonly id = input.required<string>();

  private expenseService: ExpenseService = inject(ExpenseService);

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.expenseService.removeExpense$(this.id()).subscribe({
      next: () => this.closeModal.emit(),
      error: (error) => console.error('Error deleting expense:', error),
    });
  }
}
