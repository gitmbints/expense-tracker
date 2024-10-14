import { Component, inject, OnInit, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent {
  title: string = 'Dépenses';

  expenseService: ExpenseService = inject(ExpenseService);
  formBuilder: FormBuilder = inject(FormBuilder);

  expenseList: Signal<Expense[]> = this.expenseService.getExpenseList();
  expenseCategoryList: string[] = this.expenseService.getExpenseCategoryList();

  expenseForm = this.formBuilder.group({
    name: [''],
    amount: [0],
    category: this.formBuilder.array([]),
    date: [''],
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
    console.warn(this.expenseForm.value);
  }
}
