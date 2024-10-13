import { Component, inject, OnInit, Signal } from '@angular/core';
import { ExpenseService } from '../../services/expense/expense.service';
import { Expense } from '../../model/expense';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
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

  expenseService: ExpenseService = inject(ExpenseService);
  formBuilder: FormBuilder = inject(FormBuilder);

  expenseList: Signal<Expense[]> = this.expenseService.getExpenses();

  expenseForm = this.formBuilder.group({
    name: [''],
    amount: [0],
    date: [''],
  });

  onSubmit(): void {
    console.warn(this.expenseForm.value);
  }
}
