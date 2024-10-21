import { Component, inject, OnInit, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import {
  FormArray,
  FormBuilder,
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
  formBuilder: FormBuilder = inject(FormBuilder);

  constructor() {
    this.expenseList = this.expenseService.getExpenseList();
    this.expenseCategoryList = this.expenseService.getExpenseCategoryList();
  }

  ngOnInit(): void {
    this.initDatePicker();
  }

  expenseForm = new FormGroup({
    name: new FormControl('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    amount: new FormControl(0, {
      validators: Validators.required,
      nonNullable: true,
    }),
    category: new FormControl([], {
      validators: Validators.required,
      nonNullable: true,
    }),
    date: new FormControl('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  selectCategory(event: Event, category: string): void {
    const isChecked: boolean = (event.target as HTMLInputElement).checked;
    const categoryArray: string[] = this.expenseForm.controls.category.value;

    if (isChecked) {
      categoryArray.push(category);
    } else {
      const index = categoryArray.indexOf(category);
      categoryArray.splice(index, 1);
    }

    console.log(categoryArray);
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
