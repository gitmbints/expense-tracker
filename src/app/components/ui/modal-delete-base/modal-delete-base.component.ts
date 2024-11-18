import { Component, output } from '@angular/core';

@Component({
  selector: 'app-modal-delete-base',
  standalone: true,
  imports: [],
  templateUrl: './modal-delete-base.component.html',
  styleUrl: './modal-delete-base.component.css',
})
export class ModalDeleteBaseComponent {
  readonly closeModal = output<void>();
  readonly confirmDelete = output<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onConfirm(): void {
    this.confirmDelete.emit();
  }
}
