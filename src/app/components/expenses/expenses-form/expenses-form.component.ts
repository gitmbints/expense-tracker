import { Component, inject, OnInit } from '@angular/core';
import { ExpenseService } from '../../../services/expense/expense.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Datepicker } from 'flowbite';
import { Flowbite } from '../../../flowbite/flowbite';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expenses-form.component.html',
  styleUrl: './expenses-form.component.css',
})
@Flowbite()
export class ExpensesFormComponent implements OnInit {
  readonly expenseCategoryList: string[];

  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseCategoryList = this.expenseService.getExpenseCategoryList();
  }

  ngOnInit(): void {
    this.initDatePicker();
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

  readonly expenseForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
    amount: new FormControl<number>(0, {
      validators: Validators.required,
      nonNullable: true,
    }),
    category: new FormControl<string[]>([], {
      validators: Validators.required,
      nonNullable: true,
    }),
    date: new FormControl<string>('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  private get selectedCategory(): string[] {
    return this.expenseForm.controls.category.value;
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
      this.expenseForm.controls.category.setValue([
        ...this.selectedCategory,
        category,
      ]);
    } else {
      const index = this.selectedCategory.indexOf(category);
      this.expenseForm.controls.category.setValue(
        this.selectedCategory.splice(index, 1),
      );
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

    const newExpense = this.expenseForm.getRawValue();
    this.expenseService.addExpense(newExpense);
    this.expenseForm.reset();
  }
}
