import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'admin/clients',
        pathMatch: 'full',
      },

      // Admin Routes
      {
        path: 'admin/clients',
        loadComponent: () =>
          import('./dashboard/clients-list/clients-list.component').then(
            (m) => m.AdminClientsListComponent
          ),
      },
      {
        path: 'admin/accounts',
        loadComponent: () =>
          import('./dashboard/accounts-list/accounts-list.component').then(
            (m) => m.AdminAccountsListComponent
          ),
      },
      {
        path: 'admin/deposit',
        loadComponent: () =>
          import('./dashboard/deposit/deposit.component').then(
            (m) => m.AdminDepositComponent
          ),
      },
    ],
  },
];
