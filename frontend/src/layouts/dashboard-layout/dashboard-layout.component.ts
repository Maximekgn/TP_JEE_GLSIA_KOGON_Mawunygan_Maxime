import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { AdminSidebarComponent } from '../../app/shared/components/sidebar/admin-sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AdminSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Loading Bar -->
      <div *ngIf="isRouteLoading" class="fixed top-0 left-0 right-0 h-1 z-50 overflow-hidden bg-blue-100">
        <div class="h-full bg-blue-600 animate-progress"></div>
      </div>

      <app-admin-sidebar></app-admin-sidebar>

      <main class="lg:ml-64 p-4 md:p-8 transition-all duration-300 ease-in-out">
        <div class="max-w-7xl mx-auto bounce-in">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `
      @keyframes progress {
        0% { width: 0; }
        50% { width: 70%; }
        100% { width: 100%; }
      }
      .animate-progress {
        animation: progress 1s ease-in-out infinite;
      }
      .bounce-in {
        animation: bounceIn 0.5s ease-out;
      }
      @keyframes bounceIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
  ],
})
export class DashboardLayoutComponent implements OnInit {
  private router = inject(Router);
  isRouteLoading = false;

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isRouteLoading = true;
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isRouteLoading = false;
        }, 300);
      }
    });
  }
}
