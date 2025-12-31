import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transactions-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold mb-6">Historique des Transactions</h2>
      <p class="text-slate-500">Consultez l'historique complet de vos opérations.</p>
    </div>
  `
})
export class TransactionsHistoryComponent {}
