import { Component, inject, Signal } from '@angular/core';
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

  readonly expenseForm: FormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    amount: new FormControl(0, {
      nonNullable: true,
      validators: Validators.required,
    }),
    category: new FormArray([
      new FormControl('', {
        nonNullable: true,
        validators: Validators.required,
      }),
    ]),
    date: new FormControl(new Date().toISOString(), {
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
    const expenseData = {
      name: this.expenseForm.value.name,
      amount: this.expenseForm.value.amount,
      category: this.expenseForm.value.category,
      date: this.expenseForm.value.date,
    };

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
