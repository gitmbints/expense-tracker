import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { IncomesComponent } from './components/incomes/incomes.component';
import { SavingsComponent } from './components/savings/savings.component';
import { InvestComponent } from './components/invest/invest.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
  },
  {
    path: 'incomes',
    component: IncomesComponent,
  },
  {
    path: 'savings',
    component: SavingsComponent,
  },
  {
    path: 'invest',
    component: InvestComponent,
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
];
