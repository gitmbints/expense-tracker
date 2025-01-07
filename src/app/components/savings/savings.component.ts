import { Component, inject, Signal } from '@angular/core';
import { SavingsService } from '../../services/savings/savings.service';
import { Saving } from '../../models/saving';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [],
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.css',
})
export class SavingsComponent {
  title: string = 'Epargnes';
  savingsList: Signal<Saving[]>;

  savingsService = inject(SavingsService);

  constructor() {
    this.savingsList = this.savingsService.savingList();
    console.log(this.savingsList());
  }
}
