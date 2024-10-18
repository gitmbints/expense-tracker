import { Component, inject, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Flowbite } from '../../flowbite/flowbite';

interface ExpenseForm {
  name: FormControl<string>;
  amount: FormControl<number>;
  category: FormArray<FormControl>;
  date: FormControl<string>;
}
@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
@Flowbite()
export class ExpensesComponent {
  title: string = 'Dépenses';

  expenseService: ExpenseService = inject(ExpenseService);
  formBuilder: FormBuilder = inject(FormBuilder);

  expenseList: Signal<Expense[]> = this.expenseService.getExpenseList();
  expenseCategoryList: string[] = this.expenseService.getExpenseCategoryList();

  expenseForm = this.formBuilder.group<ExpenseForm>({
    name: this.formBuilder.control<string>('', {
      validators: Validators.required,
      nonNullable: true,
    }),
    amount: this.formBuilder.control<number>(0, {
      validators: [Validators.required, Validators.min(0)],
      nonNullable: true,
    }),
    category: this.formBuilder.array([]),
    date: this.formBuilder.control<string>('', {
      nonNullable: true,
    }),
  });

  private getCategory(): FormArray {
    return this.expenseForm.get('category') as FormArray;
  }

  onCategoryChange(event: Event): void {
    const selectedCategory = this.getCategory();
    const checkboxElement = event.target as HTMLInputElement;

    if (checkboxElement.checked) {
      selectedCategory.push(this.formBuilder.control(checkboxElement.value));
    } else {
      const index = selectedCategory.controls.findIndex(
        (ctrl) => ctrl.value === checkboxElement.value,
      );
      selectedCategory.removeAt(index);
    }
  }

  onSubmit(): void {
    const expenseData = this.expenseForm.getRawValue();
    this.expenseService.addExpense(expenseData);

    console.warn(this.expenseForm.value);
  }
}
