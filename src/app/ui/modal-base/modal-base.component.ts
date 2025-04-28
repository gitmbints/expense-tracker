import { Component, output } from '@angular/core';

@Component({
  selector: 'app-modal-base',
  standalone: true,
  imports: [],
  templateUrl: './modal-base.component.html',
})
export class ModalBaseComponent {
  closeModal = output<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }
}
