import {
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Datepicker } from 'flowbite';
import { Flowbite } from '../../../flowbite/flowbite';
import { Category, Expense } from '../../../models/expense';
import { ExpenseService } from '../../../services/expense/expense.service';
import { ModalBaseComponent } from '../../ui/modal-base/modal-base.component';

@Component({
  selector: 'app-expenses-form',
  standalone: true,
  imports: [ReactiveFormsModule, ModalBaseComponent],
  templateUrl: './expenses-form.component.html',
})
@Flowbite()
export class ExpensesFormComponent implements OnInit, OnChanges {
  private expenseService: ExpenseService = inject(ExpenseService);
  protected readonly destroy = inject(DestroyRef);

  readonly expenseCategoryList = this.expenseService.categoryList;

  readonly isAddForm = input.required<boolean>();
  readonly selectedExpense = input<Expense | null>(null);

  readonly isCloseModal = output();

  ngOnInit(): void {
    this.initDatePicker();
    this.loadCategory();
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

  private loadCategory(): void {
    this.expenseService
      .fetchCategoryList$()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (categories) => {
          console.log('Categories loaded successfully!', categories);
        },
        error: (error) => {
          console.error('Loading categories failed!', error);
        },
      });
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
    return this.selectedCategory.some((cat) => cat.id === category.id);
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
        this.selectedCategory.filter((cat) => cat.id !== category.id),
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
      this.expenseService
        .createExpense$(newExpense)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: () => {
            this.expenseForm.reset();
            this.handleCloseModal();
          },
          error: (error) => {
            console.error('Failed to create expense:', error);
          },
        });
    } else {
      const expenseId = this.selectedExpense()?.id;
      if (!expenseId) {
        console.error('No expense ID found for update');
        return;
      }

      this.expenseService
        .editExpense$(expenseId, newExpense)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: () => {
            this.expenseForm.reset();
            this.handleCloseModal();
          },
          error: (error) => {
            console.error('Failed to update expense:', error);
          },
        });
    }
  }

  handleCloseModal(): void {
    this.isCloseModal.emit();
  }
}
