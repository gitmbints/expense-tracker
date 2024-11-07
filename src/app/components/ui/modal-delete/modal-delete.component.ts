import { Component, inject, input, output } from '@angular/core';
import { ExpenseService } from '../../../services/expense/expense.service';

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [],
  templateUrl: './modal-delete.component.html',
  styleUrl: './modal-delete.component.css',
})
export class ModalDeleteComponent {
  readonly closeModal = output<void>();
  readonly id = input.required<string>();

  private expenseService: ExpenseService = inject(ExpenseService);

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.expenseService.deleteExpense(this.id());
    this.closeModal.emit();
  }
}
