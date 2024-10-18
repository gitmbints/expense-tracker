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

interface ExpenseForm {
  name: FormControl<string>;
  amount: FormControl<number>;
  category: FormArray<FormControl<string>>;
  date: FormControl<string>;
}
@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  title: string = 'Dépenses';
  isModalOpen: boolean = false;

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
      validators: Validators.required,
      nonNullable: true,
    }),
    category: this.formBuilder.array([
      this.formBuilder.control<string>('', {
        validators: Validators.required,
        nonNullable: true,
      }),
    ]),
    date: this.formBuilder.control<string>('', {
      nonNullable: true,
    }),
  });

  private getCategory(): FormArray {
    return this.expenseForm.get('category') as FormArray;
  }

  onCategoryChange(event: any): void {
    const selectedCategory = this.getCategory();

    if (event.target.checked) {
      selectedCategory.push(this.formBuilder.control(event.target.value));
    } else {
      const index = selectedCategory.controls.findIndex(
        (ctrl) => ctrl.value === event.target.value,
      );
      selectedCategory.removeAt(index);
    }
  }

  onSubmit(): void {
    const expenseData = this.expenseForm.getRawValue();

    this.expenseService.addExpense(expenseData);
    console.warn(this.expenseForm.value);
  }

  onEdit(id: string): void {
    this.toggleModal();
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }
}
