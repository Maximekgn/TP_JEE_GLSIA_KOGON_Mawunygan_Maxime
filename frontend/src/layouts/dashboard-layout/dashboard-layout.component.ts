import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { DashboardNavbarComponent } from '../../app/shared/components/navbar/dashboard-navbar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DashboardNavbarComponent],
  template: `
    <div class="min-h-screen bg-neutral-100 font-sans">
      <app-dashboard-navbar></app-dashboard-navbar>
      <main class="mx-auto max-w-7xl px-6 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [],
})
export class DashboardLayoutComponent {}
