import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold mb-6">Aide & Support</h2>
      <p class="text-slate-500">Une question ? Nous sommes là pour vous aider.</p>
    </div>
  `
})
export class SupportComponent {}
