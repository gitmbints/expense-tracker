import { Component, inject, OnInit, Signal } from '@angular/core';
import { SavingsService } from '../../services/savings/savings.service';
import { Saving } from '../../models/saving';
import { LoaderSpinnerComponent } from '../ui/loader-spinner/loader-spinner.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-savings',
  standalone: true,
  imports: [LoaderSpinnerComponent, DatePipe],
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.css',
})
export class SavingsComponent implements OnInit {
  title: string = 'Epargnes';
  savingList!: Signal<Saving[]>;
  isLoading!: Signal<boolean>;

  savingsService = inject(SavingsService);

  constructor() {}

  ngOnInit(): void {
    this.savingList = this.savingsService.savingList;
    this.isLoading = this.savingsService.isLoadingState;
    console.log(this.savingList());
  }
}
