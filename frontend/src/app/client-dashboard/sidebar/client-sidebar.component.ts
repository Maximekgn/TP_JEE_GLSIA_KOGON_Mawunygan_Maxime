import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../security/core/services/auth.service';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div
      class="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50 print:hidden"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center px-8 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="bg-indigo-500 text-white p-1.5 rounded-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
              />
            </svg>
          </div>
          <span class="text-xl font-bold tracking-tight"
            >E-Bank<span class="text-indigo-400"> Client</span></span
          >
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <a
          *ngFor="let link of navLinks"
          [routerLink]="link.href"
          routerLinkActive="bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
          [routerLinkActiveOptions]="{ exact: link.href === '/dashboard/client' }"
          class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="link.icon" />
          </svg>
          <span class="font-medium text-sm">{{ link.label }}</span>
        </a>
      </nav>

      <!-- User Profile / Logout -->
      <div class="p-4 border-t border-slate-800">
        <div class="flex items-center gap-3 mb-4 px-2">
          <img
            src="https://ui-avatars.com/api/?name=Jean+Dupont&background=6366f1&color=fff"
            alt="Avatar"
            class="w-10 h-10 rounded-full border-2 border-slate-700"
          />
          <div>
            <div class="text-sm font-bold text-white">Jean Dupont</div>
            <div class="text-xs text-slate-500">Client Premium</div>
          </div>
        </div>
        <button
          (click)="logout()"
          class="flex items-center gap-2 justify-center w-full py-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-4 h-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          Déconnexion
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class ClientSidebarComponent {
  private authService = inject(AuthService);

  navLinks = [
    {
      label: 'Mes Comptes',
      href: '/dashboard/client',
      icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    },
    {
      label: 'Opérations',
      href: '/dashboard/client/operations',
      icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
      label: 'Historique',
      href: '/dashboard/client/history',
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
  ];

  logout() {
    this.authService.logout();
  }
}
