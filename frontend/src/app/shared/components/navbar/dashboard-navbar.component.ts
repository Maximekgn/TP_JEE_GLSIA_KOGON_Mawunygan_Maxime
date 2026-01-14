import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../security/core/services/auth.service';
import { NotificationService } from '../../../../security/core/services/notification.service';

@Component({
  selector: 'app-dashboard-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="h-5 w-5"
              >
                <path
                  d="M12 2 3 7v2h18V7l-9-5ZM4 10v9h4v-9H4Zm6 0v9h4v-9h-4Zm6 0v9h4v-9h-4ZM3 21h18v-1H3v1Z"
                />
              </svg>
            </span>
            <span class="text-lg">GLSIA Bank</span>
          </a>

          <!-- Right side controls -->
          <div class="flex items-center gap-3">
            <!-- Notifications (simple icon; uses NotificationService count) -->
            <button
              type="button"
              class="relative inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-700"
              (click)="toggleNotificationsHint()"
              title="Notifications"
              aria-label="Notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.7"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M14.857 17.082A23.848 23.848 0 0018 18.75V12a6 6 0 10-12 0v6.75c1.03-.38 2.11-.69 3.214-.918m5.643-.75a3 3 0 11-5.714 0"
                />
              </svg>

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.8"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l-3-3m3 3l-3 3m3-3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Optional hint (non-invasive) -->
        <div *ngIf="showNotificationsHint" class="mt-3 text-xs text-slate-500">
          Les notifications s’affichent automatiquement en haut à droite lorsque l’application en envoie.
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
    // Since toast notifications already render via NotificationComponent (fixed position),
    // this is just a lightweight UX feedback for the bell icon.
    this.showNotificationsHint = !this.showNotificationsHint;
  }

  logout(): void {
    this.authService.logout();
  }
}
