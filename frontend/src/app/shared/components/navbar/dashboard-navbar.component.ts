import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBuildingLibrary,
  heroBell,
  heroArrowRightOnRectangle,
  heroUsers,
  heroCreditCard,
  heroBanknotes,
  heroArrowDownTray,
  heroArrowsRightLeft,
  heroClipboardDocumentList
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../../security/core/services/auth.service';
import { NotificationService } from '../../../../security/core/services/notification.service';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, NgIcon],
  viewProviders: [
    provideIcons({
      heroBuildingLibrary,
      heroBell,
      heroArrowRightOnRectangle,
      heroUsers,
      heroCreditCard,
      heroBanknotes,
      heroArrowDownTray,
      heroArrowsRightLeft,
      heroClipboardDocumentList
    })
  ],
  template: `
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
      <div class="mx-auto max-w-7xl px-6 py-3">
        <div class="flex items-center justify-between gap-4">
          <!-- Brand -->
          <a
            routerLink="/dashboard"
            class="flex items-center gap-3 font-extrabold text-slate-900 tracking-tight"
            title="Accueil"
          >
            <span
              class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"
              aria-hidden="true"
            >
              <ng-icon name="heroBuildingLibrary" size="1.25rem"></ng-icon>
            </span>
            <span class="text-lg">EGA Bank</span>
          </a>

          <!-- Navigation Links -->
          <nav class="hidden md:flex items-center gap-1">
            <a
              *ngFor="let link of navLinks"
              [routerLink]="link.href"
              routerLinkActive="bg-blue-50 text-blue-600"
              [routerLinkActiveOptions]="{ exact: link.exact }"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors text-sm font-medium"
            >
              <ng-icon [name]="link.icon" size="1.125rem"></ng-icon>
              <span>{{ link.label }}</span>
            </a>
          </nav>

          <!-- Right side controls -->
          <div class="flex items-center gap-3">
            <!-- Notifications -->
            <button
              type="button"
              class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
              (click)="toggleNotificationsHint()"
              title="Notifications"
              aria-label="Notifications"
            >
              <ng-icon name="heroBell" size="1.25rem"></ng-icon>

              <span
                *ngIf="notificationCount > 0"
                class="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-bold flex items-center justify-center"
              >
                {{ notificationCount }}
              </span>
            </button>

            <!-- Profile -->
            <div class="flex items-center gap-3 pl-2 border-l border-slate-200">
              <div
                class="hidden sm:flex flex-col leading-tight"
                aria-label="Profil utilisateur"
              >
                <span class="text-sm font-bold text-slate-900">{{ userName }}</span>
                <span class="text-xs text-slate-500">{{ userRole }}</span>
              </div>

              <div
                class="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold"
                title="Profil"
              >
                {{ initials }}
              </div>

              <button
                type="button"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
                (click)="logout()"
                title="Déconnexion"
              >
                <span class="hidden sm:inline">Déconnexion</span>
                <ng-icon name="heroArrowRightOnRectangle" size="1.25rem"></ng-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Optional hint (non-invasive) -->
        <div *ngIf="showNotificationsHint" class="mt-3 text-xs text-slate-500">
          Les notifications s'affichent automatiquement en haut à droite lorsque l'application en envoie.
        </div>
      </div>
    </header>
  `,
  styles: [],
})
export class DashboardNavbarComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  showNotificationsHint = false;

  navLinks = [
    { label: 'Clients', href: '/dashboard/admin/clients', icon: 'heroUsers', exact: false },
    { label: 'Comptes', href: '/dashboard/admin/accounts', icon: 'heroCreditCard', exact: false },
    { label: 'Dépôt', href: '/dashboard/admin/deposit', icon: 'heroBanknotes', exact: true },
    { label: 'Retrait', href: '/dashboard/admin/withdraw', icon: 'heroArrowDownTray', exact: true },
    { label: 'Virement', href: '/dashboard/admin/transfer', icon: 'heroArrowsRightLeft', exact: true },
    { label: 'Transactions', href: '/dashboard/admin/transactions', icon: 'heroClipboardDocumentList', exact: true },
  ];

  get notificationCount(): number {
    try {
      return this.notificationService.notifications().length;
    } catch {
      return 0;
    }
  }

  get userEmail(): string {
    return localStorage.getItem('auth_email') || '';
  }

  get userName(): string {
    const email = this.userEmail;
    if (!email) return 'Administrateur';
    return email.split('@')[0] || 'Administrateur';
  }

  get userRole(): string {
    return 'Administrateur';
  }

  get initials(): string {
    const name = (this.userName || 'A').trim();
    const parts = name.split(/[.\-_ ]+/).filter(Boolean);
    const first = parts[0]?.charAt(0) || 'A';
    const second = parts[1]?.charAt(0) || '';
    return (first + second).toUpperCase();
  }

  toggleNotificationsHint(): void {
    this.showNotificationsHint = !this.showNotificationsHint;
  }

  logout(): void {
    this.authService.logout();
  }
}
