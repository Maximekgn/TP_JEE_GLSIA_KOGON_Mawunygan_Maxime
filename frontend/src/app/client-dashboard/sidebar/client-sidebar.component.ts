import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';

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
          <div class="bg-blue-500 text-white p-1.5 rounded-lg">
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
            >E-Bank<span class="text-blue-400"> Client</span></span
          >
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <a
          *ngFor="let link of navLinks"
          [routerLink]="link.href"
          routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          [routerLinkActiveOptions]="{ exact: link.href === '/client/dashboard' }"
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

      <!-- User Profile Link / Logout -->
      <div class="p-4 border-t border-slate-800">
        <a
          routerLink="/client/dashboard/profile"
          class="flex items-center gap-3 mb-4 px-3 py-2 rounded-xl hover:bg-slate-800/50 transition-all duration-200 group cursor-pointer"
          title="Voir mon profil"
        >
          <img
            [src]="getAvatarUrl()"
            [alt]="clientFullName"
            class="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors"
          />
          <div class="flex-1 min-w-0">
            <div
              class="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors"
            >
              {{ clientFullName }}
            </div>
            <div class="text-xs text-slate-500 truncate">{{ clientEmail }}</div>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors"
          >
            <path
              fill-rule="evenodd"
              d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
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
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }

      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(15, 23, 42, 0.3);
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(100, 116, 139, 0.5);
        border-radius: 10px;
      }

      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: rgba(100, 116, 139, 0.7);
      }
    `,
  ],
})
export class ClientSidebarComponent implements OnInit {
  private clientAuthService = inject(ClientAuthService);

  clientFullName: string = 'Client';
  clientEmail: string = '';

  navLinks = [
    {
      label: 'Mes Comptes',
      href: '/client/dashboard',
      icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    },
    {
      label: 'Opérations',
      href: '/client/dashboard/operations',
      icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
      label: 'Historique',
      href: '/client/dashboard/history',
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
    {
      label: 'Mon Profil',
      href: '/client/dashboard/profile',
      icon: 'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    },
  ];


  ngOnInit() {
    this.loadClientInfo();
  }

  loadClientInfo() {
    this.clientFullName = this.clientAuthService.getUserFullName();
    this.clientEmail = this.clientAuthService.getUserEmail() || '';

    // Optionally load full client info from API
    this.clientAuthService.getCurrentClient().subscribe({
      next: (client) => {
        this.clientFullName = `${client.first_name} ${client.last_name}`;
        this.clientEmail = client.email;
      },
      error: (err) => {
        console.error('Error loading client info:', err);
      },
    });
  }

  getAvatarUrl(): string {
    const name = encodeURIComponent(this.clientFullName || 'Client');
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff`;
  }

  logout() {
    this.clientAuthService.logout();
  }
}
