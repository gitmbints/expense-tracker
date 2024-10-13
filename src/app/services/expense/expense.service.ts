import { Injectable, Signal, signal } from '@angular/core';
import * as expensesData from '../../../data/expenses.json';
import { Expense } from '../../model/expense';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly expenses = signal<Expense[]>(expensesData.data);

  constructor() {
    console.log('data from json : ', this.expenses());
  }

  getExpenses(): Signal<Expense[]> {
    return this.expenses.asReadonly();
  }

  // TODO add new expenses entry into expenses signal
  // TODO modify existing expenses entry from expenses signal
  // TODO delete existing expenses entry from expenses signal
}
