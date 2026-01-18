import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroUsers,
  heroCreditCard,
  heroBanknotes,
  heroArrowDownTray,
  heroArrowsRightLeft,
  heroClipboardDocumentList,
  heroArrowRightOnRectangle,
  heroBuildingLibrary,
  heroPlusCircle
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../../security/core/services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  viewProviders: [
    provideIcons({
      heroUsers,
      heroCreditCard,
      heroBanknotes,
      heroArrowDownTray,
      heroArrowsRightLeft,
      heroClipboardDocumentList,
      heroArrowRightOnRectangle,
      heroBuildingLibrary,
      heroPlusCircle
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
            >GLSIA<span class="text-blue-400"> Bank</span></span
          >
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">
          Administration
        </div>
        <a
          *ngFor="let link of navLinks"
          [routerLink]="link.href"
          routerLinkActive="bg-blue-600 text-white shadow-lg shadow-blue-600/20"
          [routerLinkActiveOptions]="{ exact: link.exact }"
          class="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <ng-icon [name]="link.icon" size="1.25rem"></ng-icon>
          <span class="font-medium text-sm">{{ link.label }}</span>
        </a>
      </nav>

      <!-- User Profile / Logout -->
      <div class="p-4 border-t border-slate-800">
        <div class="flex items-center gap-3 mb-4 px-3 py-2">
          <div
            class="w-10 h-10 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-sm"
          >
            {{ initials }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-white truncate">
              {{ userName }}
            </div>
            <div class="text-xs text-slate-500">Administrateur</div>
          </div>
        </div>
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
export class AdminSidebarComponent {
  private authService = inject(AuthService);

  navLinks = [
    { label: 'Clients', href: '/dashboard/admin/clients', icon: 'heroUsers', exact: false },
    { label: 'Comptes', href: '/dashboard/admin/accounts', icon: 'heroCreditCard', exact: false },
    { label: 'Nouveau Compte', href: '/dashboard/admin/accounts/create', icon: 'heroPlusCircle', exact: true },
    { label: 'Dépôt', href: '/dashboard/admin/deposit', icon: 'heroBanknotes', exact: true },
    { label: 'Retrait', href: '/dashboard/admin/withdraw', icon: 'heroArrowDownTray', exact: true },
    { label: 'Virement', href: '/dashboard/admin/transfer', icon: 'heroArrowsRightLeft', exact: true },
    { label: 'Transactions', href: '/dashboard/admin/transactions', icon: 'heroClipboardDocumentList', exact: true },
  ];

  get userEmail(): string {
    return localStorage.getItem('auth_email') || '';
  }

  get userName(): string {
    const email = this.userEmail;
    if (!email) return 'Administrateur';
    return email.split('@')[0] || 'Administrateur';
  }

  get initials(): string {
    const name = (this.userName || 'A').trim();
    const parts = name.split(/[.\-_ ]+/).filter(Boolean);
    const first = parts[0]?.charAt(0) || 'A';
    const second = parts[1]?.charAt(0) || '';
    return (first + second).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
