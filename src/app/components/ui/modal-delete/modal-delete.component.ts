import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal-delete',
  standalone: true,
  imports: [],
  templateUrl: './modal-delete.component.html',
  styleUrl: './modal-delete.component.css',
})
export class ModalDeleteComponent {
  readonly closeModal = output<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
