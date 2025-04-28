import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { authGuard } from './auth/auth.guard';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { IncomesComponent } from './incomes/incomes.component';
import { InvestComponent } from './invest/invest.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SavingsComponent } from './savings/savings.component';
// ... existing code ...

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'incomes',
    component: IncomesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'savings',
    component: SavingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'invest',
    component: InvestComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
