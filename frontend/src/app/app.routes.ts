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
          import('./dashboard/deposit/deposit.component').then((m) => m.AdminDepositComponent),
      },
      {
        path: 'admin/withdraw',
        loadComponent: () =>
          import('./dashboard/withdrawal/withdrawal.component').then((m) => m.WithdrawalComponent),
      },
      {
        path: 'admin/transfer',
        loadComponent: () =>
          import('./dashboard/transfer/transfer.component').then((m) => m.TransferComponent),
      },
      {
        path: 'admin/transactions',
        loadComponent: () =>
          import('./dashboard/transactions/transactions-history.component').then(
            (m) => m.TransactionsHistoryComponent
          ),
      },
    ],
  },

  // Client Dashboard Routes
  {
    path: 'dashboard/client',
    loadComponent: () =>
      import('./client-dashboard/layout/client-layout.component').then(
        (m) => m.ClientLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./client-dashboard/my-accounts/my-accounts.component').then(
            (m) => m.MyAccountsComponent
          ),
      },
      {
        path: 'operations',
        loadComponent: () =>
          import('./client-dashboard/operations/client-operations.component').then(
            (m) => m.ClientOperationsComponent
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./client-dashboard/history/client-history.component').then(
            (m) => m.ClientHistoryComponent
          ),
      },
    ],
  },
];
