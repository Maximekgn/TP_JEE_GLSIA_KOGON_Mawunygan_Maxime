import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: [],
})
export class SidebarComponent {
  private authService = inject(AuthService);

  navLinks = [
    {
      label: 'Accueil',
      href: '/dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      role: 'ANY'
    },
    {
      label: 'Mes Comptes',
      href: '/dashboard/accounts',
      icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      role: 'CLIENT'
    },
    {
      label: 'Transactions',
      href: '/dashboard/transactions',
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      role: 'CLIENT'
    },
    {
        label: 'Tous les Clients',
        href: '/dashboard/admin/clients',
        icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-3.833-6.233 4.125 4.125 0 00-3.833 6.233zM15 19.128v.003c0 .03.01.058.028.082L14.241 14.22a.75.75 0 011.292-.757l1.817 3.102a.75.75 0 01-1.292.756l-.503-.86a1.875 1.875 0 10-2.583 2.583zM12 18.75a6 6 0 006-6H6a6 6 0 006 6z',
        role: 'ADMIN'
    },
    {
        label: 'Tous les Comptes',
        href: '/dashboard/admin/accounts',
        icon: 'M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 5.25v.75m0 5.25v.75m15-12.75V4.5m0 5.25v.75m0 5.25v.75m-15 0h.008v.008H3.75V16.5zm15 0h.008v.008h-.008V16.5zm-15-5.25h.008v.008H3.75v-.008zm15 0h.008v.008h-.008v-.008zm-15-5.25h.008v.008H3.75V6zm15 0h.008v.008h-.008V6zm-12.25 0h11.5c.663 0 1.25.537 1.25 1.25v11.5c0 .663-.537 1.25-1.25 1.25h-11.5c-.663 0-1.25-.537-1.25-1.25V7.25c0-.663.537-1.25 1.25-1.25z',
        role: 'ADMIN'
    },
    {
        label: 'Effectuer un Dépôt',
        href: '/dashboard/admin/deposit',
        icon: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
        role: 'ADMIN'
    },
    {
      label: 'Mon Profil',
      href: '/dashboard/profile',
      icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      role: 'ANY'
    },
  ];

  get filteredLinks() {
    const userRole = this.authService.getUserType();
    return this.navLinks.filter(link => 
        link.role === 'ANY' || link.role === userRole
    );
  }

  getUserName() {
    // Ideally we would get this from a user subject, but for now we can use a placeholder or local storage
    return localStorage.getItem('auth_email')?.split('@')[0] || 'Utilisateur';
  }

  getUserRoleTitle() {
    return this.authService.getUserType() === 'ADMIN' ? 'Administrateur' : 'Client Premium';
  }

  logout() {
    this.authService.logout();
  }
}
