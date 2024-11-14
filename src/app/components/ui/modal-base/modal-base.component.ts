import { Component, output } from '@angular/core';

@Component({
  selector: 'app-modal-base',
  standalone: true,
  imports: [],
  templateUrl: './modal-base.component.html',
  styleUrl: './modal-base.component.css',
})
export class ModalBaseComponent {
  closeModal = output<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
