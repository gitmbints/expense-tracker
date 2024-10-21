import { Component, inject, OnInit, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
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
  formBuilder: FormBuilder = inject(FormBuilder);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
    this.expenseCategoryList = this.expenseService.getExpenseCategoryList();
  }

  ngOnInit(): void {
    this.initDatePicker();
  }

  expenseForm = this.formBuilder.group({
    name: [''],
    amount: [0],
    category: this.formBuilder.array([]),
    date: [''],
  });

  get categoryArray(): FormArray {
    return this.expenseForm.get('category') as FormArray;
  }

  onSelectCategory(event: Event, category: string): void {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.checked) {
      this.categoryArray.push(new FormControl(category));
    } else {
      const index = this.categoryArray.controls.findIndex(
        (control) => control.value === category,
      );

      if (index >= 0) {
        this.categoryArray.removeAt(index);
      }
    }
  }

  isSelected(category: string): boolean {
    return this.categoryArray.value.includes(category);
  }

  private initDatePicker(): void {
    setTimeout(() => {
      const datePickerElement: HTMLInputElement = document.getElementById(
        'datepicker-actions',
      ) as HTMLInputElement;
      new Datepicker(datePickerElement);

      datePickerElement?.addEventListener('changeDate', (e: any) => {
        const value = e.target.value;
        const dateFormControl = this.expenseForm.controls.date;
        dateFormControl?.setValue(value);
        dateFormControl?.markAsDirty;
      });
    });
  }

  onSubmit(): void {
    console.log(this.expenseForm.value);
    this.expenseForm.reset();
  }
}
