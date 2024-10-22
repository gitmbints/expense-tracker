import { Component, inject, OnInit, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import {
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
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    amount: new FormControl(0, {
      validators: Validators.required,
      nonNullable: true,
    }),
    category: new FormControl([], {
      validators: Validators.minLength(1),
      nonNullable: true,
    }),
    date: new FormControl('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  private categoryArray: string[] = this.expenseForm.controls.category.value;

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

  hasCategory(category: string): boolean {
    return this.categoryArray.includes(category);
  }

  isCategoryLengthReached(category: string): boolean {
    if (this.categoryArray.length === 1 && this.hasCategory(category)) {
      return false;
    }

    if (this.categoryArray.length > 2 && !this.hasCategory(category)) {
      return false;
    }

    return true;
  }

  selectCategory(event: Event, category: string): void {
    const isChecked: boolean = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.categoryArray.push(category);
    } else {
      const index = this.categoryArray.indexOf(category);
      this.categoryArray.splice(index, 1);
    }
  }

  isInvalidAndTouchedOrDirty(formControl: FormControl): boolean {
    return formControl.invalid && (formControl.touched || formControl.dirty);
  }

  onSubmit(): void {
    this.expenseForm.markAllAsTouched();

    if (this.expenseForm.invalid) {
      return;
    }

    console.log(this.expenseForm.value);
    this.expenseForm.reset();
  }
}
