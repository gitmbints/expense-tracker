import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { IncomesComponent } from './components/incomes/incomes.component';
import { SavingsComponent } from './components/savings/savings.component';
import { InvestComponent } from './components/invest/invest.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { AuthComponent } from "./components/auth/auth.component";
import { authGuard } from "./guards/auth.guard";

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
