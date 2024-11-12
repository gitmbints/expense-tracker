import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  Signal,
} from '@angular/core';
import { ExpenseService } from '../../../services/expense/expense.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Datepicker } from 'flowbite';
import { Flowbite } from '../../../flowbite/flowbite';
import { Category, Expense } from '../../../models/expense';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expenses-form.component.html',
  styleUrl: './expenses-form.component.css',
})
@Flowbite()
export class ExpensesFormComponent implements OnInit, OnChanges {
  readonly expenseCategoryList: Signal<Category[]>;

  readonly isAddForm = input.required<boolean>();
  readonly selectedExpense = input<Expense | null>(null);

  readonly isCloseModal = output();

  expenseService: ExpenseService = inject(ExpenseService);

  constructor() {
    this.expenseCategoryList = this.expenseService.getCategoryList();
  }

  ngOnInit(): void {
    this.initDatePicker();
  }

  ngOnChanges(): void {
    const expense = this.selectedExpense();

    if (expense) {
      this.expenseForm.patchValue({
        name: expense.name,
        amount: expense.amount,
        categories: expense.categories,
        date: expense.date,
      });
    }
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
    categories: new FormControl<Category[]>([], {
      validators: Validators.required,
      nonNullable: true,
    }),
    date: new FormControl<string>('', {
      validators: Validators.required,
      nonNullable: true,
    }),
  });

  get expenseFormControls() {
    return this.expenseForm.controls;
  }

  private get selectedCategory(): Category[] {
    return this.expenseFormControls.categories.value;
  }

  hasCategory(category: Category): boolean {
    return this.selectedCategory.includes(category);
  }

  isCategoryLengthReached(category: Category): boolean {
    const selectedCategoryLength = this.selectedCategory.length;
    if (selectedCategoryLength === 1 && this.hasCategory(category)) {
      return false;
    }

    if (selectedCategoryLength > 2 && !this.hasCategory(category)) {
      return false;
    }

    return true;
  }

  selectCategory(event: Event, category: Category): void {
    const isChecked: boolean = (event.target as HTMLInputElement).checked;

    if (isChecked) {
      this.expenseFormControls.categories.setValue([
        ...this.selectedCategory,
        category,
      ]);
    } else {
      this.expenseFormControls.categories.setValue(
        this.selectedCategory.filter((cat) => cat !== category),
      );
    }
  }

  isInvalidAndTouched(formControl: FormControl): boolean {
    return formControl.invalid && formControl.touched;
  }

  onSubmit(): void {
    this.expenseForm.markAllAsTouched();

    if (this.expenseForm.invalid) {
      return;
    }

    const newExpense = this.expenseForm.getRawValue();

    if (this.isAddForm()) {
      this.expenseService.addExpense(newExpense);
    } else {
      this.expenseService.updateExpense(this.selectedExpense()?.id, newExpense);
    }

    this.expenseForm.reset();
    this.closeModal();
  }

  closeModal(): void {
    this.isCloseModal.emit();
  }
}
