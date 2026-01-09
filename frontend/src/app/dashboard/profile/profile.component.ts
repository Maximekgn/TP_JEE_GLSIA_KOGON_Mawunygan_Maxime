import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Legacy client profile page.
 *
 * Clients are no longer allowed to login, therefore this screen is disabled.
 * If an admin lands here via an old bookmark, we redirect them to the admin area.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-6">
      <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 class="text-xl font-bold text-slate-900">Page désactivée</h2>
        <p class="mt-2 text-sm text-slate-600">
          Les clients n'ont plus accès à l'application. Cette page "Profil" (ancienne version) est
          désactivée.
        </p>

        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors"
            (click)="goDashboard()"
          >
            Aller au tableau de bord admin
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors"
            (click)="logout()"
          >
            Se déconnecter
          </button>
        </div>

        <div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <p class="text-xs">
            Si tu souhaites gérer les informations d'un client, fais-le depuis
            <strong>Admin → Clients</strong>.
          </p>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  goDashboard(): void {
    this.router.navigate(['/dashboard/admin/clients']);
  }

  logout(): void {
    this.authService.logout();
  }
}
