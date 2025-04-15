import { Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IncomeService } from '../../../services/income/income.service';
import { ModalDeleteBaseComponent } from '../../ui/modal-delete-base/modal-delete-base.component';

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [ModalDeleteBaseComponent],
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {
  private incomeService = inject(IncomeService);
  protected readonly destroy = inject(DestroyRef);

  readonly closeModal = output<void>();
  readonly id = input.required<string>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.incomeService
      .removeIncome$(this.id())
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          console.log('Income deleted successfully!');
          this.closeModal.emit();
        },
        error: () => {
          console.log('Deleting income failed!');
        },
      });
    this.closeModal.emit();
  }
}
