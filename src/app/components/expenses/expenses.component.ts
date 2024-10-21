import { Component, inject, OnInit, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Flowbite } from '../../flowbite/flowbite';
import { Datepicker } from 'flowbite';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
@Flowbite()
export class ExpensesComponent implements OnInit {
  readonly title: string = 'Dépenses';
  expenseList: Signal<Expense[]>;
  expenseCategoryList: string[];

  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
    this.expenseCategoryList = this.expenseService.getExpenseCategoryList();
  }

  ngOnInit(): void {
    this.initDatePicker();
  }

  expenseForm = new FormGroup({
    name: new FormControl(''),
    amount: new FormControl(0),
    date: new FormControl(''),
  });

  private initDatePicker(): void {
    setTimeout(() => {
      const datePickerElement = document.getElementById('datepicker-actions');
      new Datepicker(datePickerElement);

      datePickerElement?.addEventListener('changeDate', (e: any) => {
        const value = e.target.value;
        const formControl = this.expenseForm.controls.date;
        formControl?.setValue(value);
        formControl?.markAsDirty;
      });
    });
  }

  onSubmit(): void {
    console.log(this.expenseForm.value);
    this.expenseForm.reset();
  }
}
