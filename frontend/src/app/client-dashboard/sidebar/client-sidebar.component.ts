import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCreditCard,
  heroArrowsRightLeft,
  heroClock,
  heroUserCircle,
  heroArrowRightOnRectangle,
  heroBuildingLibrary,
  heroChevronRight
} from '@ng-icons/heroicons/outline';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';

@Component({
  selector: 'app-client-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  viewProviders: [
    provideIcons({
      heroCreditCard,
      heroArrowsRightLeft,
      heroClock,
      heroUserCircle,
      heroArrowRightOnRectangle,
      heroBuildingLibrary,
      heroChevronRight
    })
  ],
  template: `
    <div
      class="h-screen w-64 bg-slate-900 text-white fixed left-0 top-0 flex flex-col shadow-xl z-50 print:hidden"
    >
      <!-- Logo -->
      <div class="h-20 flex items-center px-8 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <div class="bg-blue-500 text-white p-1.5 rounded-lg">
            <ng-icon name="heroBuildingLibrary" size="1.25rem"></ng-icon>
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
          <ng-icon [name]="link.icon" size="1.25rem"></ng-icon>
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
          <ng-icon name="heroChevronRight" size="1rem" class="text-slate-600 group-hover:text-blue-400 transition-colors"></ng-icon>
        </a>
        <button
          (click)="logout()"
          class="flex items-center gap-2 justify-center w-full py-2.5 bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white rounded-lg transition-colors text-sm font-medium cursor-pointer"
        >
          <ng-icon name="heroArrowRightOnRectangle" size="1rem"></ng-icon>
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
      icon: 'heroCreditCard',
    },
    {
      label: 'Opérations',
      href: '/client/dashboard/operations',
      icon: 'heroArrowsRightLeft',
    },
    {
      label: 'Historique',
      href: '/client/dashboard/history',
      icon: 'heroClock',
    },
    {
      label: 'Mon Profil',
      href: '/client/dashboard/profile',
      icon: 'heroUserCircle',
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
