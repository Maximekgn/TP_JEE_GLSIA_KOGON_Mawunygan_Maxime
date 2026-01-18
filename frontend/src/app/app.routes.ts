import { Routes } from '@angular/router';
import { authGuard } from '../security/core/guards/auth.guard';
import { clientAuthGuard } from '../security/core/guards/client-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./landing-page/landing-page.component').then((m) => m.LandingPageComponent),
  },

  // Admin Login
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },

  // Client Authentication Routes
  {
    path: 'client/login',
    loadComponent: () =>
      import('./client-login/client-login.component').then((m) => m.ClientLoginComponent),
  },
  {
    path: 'client/register',
    loadComponent: () =>
      import('./client-register/client-register.component').then((m) => m.ClientRegisterComponent),
  },

  // Admin Dashboard Routes
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../layouts/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
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
            (m) => m.AdminClientsListComponent,
          ),
      },

      {
        path: 'admin/clients/:id',
        loadComponent: () =>
          import('./dashboard/clients-list/client-details.component').then(
            (m) => m.ClientDetailsComponent,
          ),
      },
      {
        path: 'admin/accounts',
        loadComponent: () =>
          import('./dashboard/accounts-list/accounts-list.component').then(
            (m) => m.AdminAccountsListComponent,
          ),
      },
      {
        path: 'admin/accounts/create',
        loadComponent: () =>
          import('./dashboard/accounts-create/account-create.component').then(
            (m) => m.AccountCreateComponent,
          ),
      },
      {
        path: 'admin/accounts/:id',
        loadComponent: () =>
          import('./dashboard/accounts-list/account-details.component').then(
            (m) => m.AccountDetailsComponent,
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
            (m) => m.TransactionsHistoryComponent,
          ),
      },
    ],
  },

  // Client Dashboard Routes
  {
    path: 'client/dashboard',
    canActivate: [clientAuthGuard],
    loadComponent: () =>
      import('./client-dashboard/layout/client-layout.component').then(
        (m) => m.ClientLayoutComponent,
      ),
    children: [
      {
        path: '',
        redirectTo: 'acceuil',
        pathMatch: 'full',
      },
      {
        path: 'acceuil',
        loadComponent: () =>
          import('./client-dashboard/acceuil/acceuil.component').then(
            (m) => m.AcceuilComponent,
          ),
      },
      {
        path: 'operations',
        loadComponent: () =>
          import('./client-dashboard/operations/client-operations.component').then(
            (m) => m.ClientOperationsComponent,
          ),
      },
      {
        path: 'accounts',
        loadComponent: () =>
          import('./client-dashboard/my-accounts/my-accounts.component').then(
            (m) => m.MyAccountsComponent,
          ),
      },
      {
        path: 'accounts/:id',
        loadComponent: () =>
          import('./client-dashboard/account-details/account-details.component').then(
            (m) => m.AccountDetailsComponent,
          ),
      },
      {
        path: 'transactions/:id',
        loadComponent: () =>
          import('./shared/components/transaction-details/transaction-details.component').then(
            (m) => m.TransactionDetailsComponent,
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./client-dashboard/history/client-history.component').then(
            (m) => m.ClientHistoryComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./client-dashboard/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
      },
    ],
  },


  // Fallback route
  {
    path: '**',
    redirectTo: '',
  },
];
