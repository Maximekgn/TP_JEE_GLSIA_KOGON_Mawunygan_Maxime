import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="flex min-h-screen bg-neutral-100 font-sans">
      <app-sidebar></app-sidebar>
      <div class="ml-64 flex-1 p-8">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardLayoutComponent {}
