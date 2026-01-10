import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ClientSidebarComponent } from '../sidebar/client-sidebar.component';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ClientSidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <app-client-sidebar></app-client-sidebar>

      <main class="ml-64 p-8 transition-all duration-300 ease-in-out">
        <div class="max-w-7xl mx-auto">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [],
})
export class ClientLayoutComponent {}
