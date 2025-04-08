import { Component, DestroyRef, inject, input, output } from "@angular/core";
import { InvestmentsService } from '../../../services/investments/investments.service';
import { ModalDeleteBaseComponent } from '../../ui/modal-delete-base/modal-delete-base.component';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [ModalDeleteBaseComponent],
  templateUrl: './modal-delete.component.html',
})
export class ModalDeleteComponent {
  private investmentsService = inject(InvestmentsService);
  protected readonly destroy = inject(DestroyRef);

  readonly closeModal = output<void>();
  readonly id = input.required<string>();


  onCloseModal(): void {
    this.closeModal.emit();
  }

  onDeleteItem(): void {
    this.investmentsService.removeInvest$(this.id()).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        console.log("Invest deleted successfully!");
        this.closeModal.emit();
      },
      error: () => { console.log("Deleting invest failed!") }
    });
  }
}
