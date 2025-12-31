import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold mb-6">Mes Comptes</h2>
      <p class="text-slate-500">Liste détaillée de vos comptes.</p>
      <!-- Detailed list implementation would go here -->
    </div>
  `
})
export class AccountsListComponent {}
