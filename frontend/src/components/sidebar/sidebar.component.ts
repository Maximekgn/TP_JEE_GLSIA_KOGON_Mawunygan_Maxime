import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../security/core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: [],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  /**
   * Single admin dashboard navigation.
   */
  navLinks = [
    {
      label: 'Accueil',
      href: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 011 1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      label: 'Tous les Clients',
      href: '/dashboard/admin/clients',
      icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.833-6.233 4.125 4.125 0 00-3.833 6.233zM15 19.128v.003c0 .03.01.058.028.082L14.241 14.22a.75.75 0 011.292-.757l1.817 3.102a.75.75 0 01-1.292.756l-.503-.86a1.875 1.875 0 10-2.583 2.583zM12 18.75a6 6 0 006-6H6a6 6 0 006 6z',
    },
    {
      label: 'Tous les Comptes',
      href: '/dashboard/admin/accounts',
      icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 5.25v.75m0 5.25v.75m15-12.75V4.5m0 5.25v.75m0 5.25v.75m-15 0h.008v.008H3.75V16.5zm15 0h.008v.008h-.008V16.5zm-15-5.25h.008v.008H3.75v-.008zm15 0h.008v.008h-.008v-.008zm-15-5.25h.008v.008H3.75V6zm15 0h.008v.008h-.008V6zm-12.25 0h11.5c.663 0 1.25.537 1.25 1.25v11.5c0 .663-.537 1.25-1.25 1.25h-11.5c-.663 0-1.25-.537-1.25-1.25V7.25c0-.663.537-1.25 1.25-1.25z',
    },
    {
      label: 'Effectuer un Dépôt',
      href: '/dashboard/admin/deposit',
      icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Effectuer un Retrait',
      href: '/dashboard/admin/withdraw',
      icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    },
    {
      label: 'Faire un Virement',
      href: '/dashboard/admin/transfer',
      icon: 'M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
    },
    {
      label: 'Historique & Relevé',
      href: '/dashboard/admin/transactions',
      icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    },
  ];

  get filteredLinks() {
    // Dashboard routes are already protected by authGuard.
    return this.authService.isLoggedIn() ? this.navLinks : [];
  }

  getUserName() {
    return localStorage.getItem('auth_email')?.split('@')[0] || 'Administrateur';
  }

  getUserRoleTitle() {
    return 'Administrateur';
  }

  logout() {
    this.authService.logout();
  }
}
