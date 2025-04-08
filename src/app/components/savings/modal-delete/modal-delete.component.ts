import { Component, DestroyRef, inject, input, output } from "@angular/core";
import { ModalDeleteBaseComponent } from '../../ui/modal-delete-base/modal-delete-base.component';
import { SavingsService } from '../../../services/savings/savings.service';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [ModalDeleteBaseComponent],
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {
  readonly savingsService = inject(SavingsService);
  protected readonly destroy = inject(DestroyRef);

  readonly closeModal = output<void>();
  readonly id = input.required<string>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.savingsService.removeSaving$(this.id()).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        console.log("Saving deleted successfully!");
        this.closeModal.emit();
      },
      error: () => { console.log("Deleting saving failed!") }
    });
  }
}
