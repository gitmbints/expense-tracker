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
  readonly expenseList: Signal<Expense[]>;
  readonly expenseCategoryList: string[];
  private selectedCategory: string[] = [];

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
    category: new FormControl(this.selectedCategory, {
      validators: Validators.required,
      nonNullable: true,
    }),
    date: new FormControl('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

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
    return this.selectedCategory.includes(category);
  }

  isCategoryLengthReached(category: string): boolean {
    if (this.selectedCategory.length === 1 && this.hasCategory(category)) {
      return false;
    }

    if (this.selectedCategory.length > 2 && !this.hasCategory(category)) {
      return false;
    }

    return true;
  }

  selectCategory(event: Event, category: string): void {
    const isChecked: boolean = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.selectedCategory.push(category);
    } else {
      const index = this.selectedCategory.indexOf(category);
      this.selectedCategory.splice(index, 1);
    }

    this.expenseForm.controls.category.setValue(this.selectedCategory);
  }

  isInvalidAndTouchedOrDirty(formControl: FormControl): boolean {
    return formControl.invalid && (formControl.touched || formControl.dirty);
  }

  onSubmit(): void {
    this.expenseForm.markAllAsTouched();

    if (this.expenseForm.invalid) {
      return;
    }

    const newExpense = this.expenseForm.getRawValue();
    this.expenseService.addExpense(newExpense);
    this.expenseForm.reset();
  }
}
