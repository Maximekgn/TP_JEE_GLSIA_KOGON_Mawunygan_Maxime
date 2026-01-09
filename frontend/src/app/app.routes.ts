import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
      },
    ],
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard-layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'admin/clients',
        pathMatch: 'full',
      },

      // Admin Routes (ADMIN only)
      {
        path: 'admin/clients',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./dashboard/admin/clients-list/clients-list.component').then(
            (m) => m.AdminClientsListComponent
          ),
      },
      {
        path: 'admin/accounts',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./dashboard/admin/accounts-list/accounts-list.component').then(
            (m) => m.AdminAccountsListComponent
          ),
      },
      {
        path: 'admin/deposit',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./dashboard/admin/deposit/deposit.component').then(
            (m) => m.AdminDepositComponent
          ),
      },
    ],
  },
];
