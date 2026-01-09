import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen flex flex-col bg-neutral-50 font-sans text-slate-800">
      <div class="flex-grow">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [],
})
export class MainLayoutComponent {}
