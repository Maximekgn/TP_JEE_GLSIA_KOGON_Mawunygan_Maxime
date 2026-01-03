import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankService, Transaction, Account } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-transactions-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Historique des Transactions</h2>
        <p class="text-slate-500">Consultez l'historique complet de vos opérations bancaires.</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div *ngIf="loading" class="flex h-64 items-center justify-center">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
        </div>

        <div *ngIf="!loading && transactions.length === 0" class="p-12 text-center text-slate-500">
          Aucune transaction trouvée.
        </div>

        <div *ngIf="!loading && transactions.length > 0" class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-slate-50 bg-slate-50/50">
                <th class="px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
                <th class="px-6 py-4 text-sm font-semibold text-slate-900">Description</th>
                <th class="px-6 py-4 text-sm font-semibold text-slate-900">Compte</th>
                <th class="px-6 py-4 text-sm font-semibold text-slate-900">Type</th>
                <th class="px-6 py-4 text-sm font-semibold text-slate-900 text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let tx of transactions" class="hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4 text-sm text-slate-600">
                  {{ tx.transactionDate | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span class="font-medium text-slate-900">{{ tx.description || 'Virement' }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600 font-mono">
                  {{ tx.sourceAccount?.accountNumber?.slice(-4) || 'N/A' }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <span [ngClass]="{
                    'bg-green-50 text-green-700': tx.transactionType === 'CREDIT',
                    'bg-red-50 text-red-700': tx.transactionType === 'DEBIT',
                    'bg-blue-50 text-blue-700': tx.transactionType === 'TRANSFER'
                  }" class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                    {{ tx.transactionType }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-right font-bold transition-all" [ngClass]="tx.transactionType === 'DEBIT' ? 'text-red-600' : 'text-green-600'">
                  <span *ngIf="tx.transactionType === 'DEBIT'">-</span>
                  <span *ngIf="tx.transactionType === 'CREDIT'">+</span>
                  {{ tx.amount | number:'1.2-2' }} FCFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TransactionsHistoryComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  transactions: Transaction[] = [];
  loading = true;

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchTransactions(userId);
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  fetchTransactions(userId: number): void {
    this.bankService.getAccountsByClient(userId).subscribe({
      next: (accounts: Account[]) => {
        console.log('Client accounts for transactions:', accounts);
        if (accounts.length === 0) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const txRequests = accounts.map(acc => this.bankService.getTransactionsByAccount(acc.id));
        forkJoin(txRequests).subscribe({
          next: (results) => {
            console.log('Transactions results from all accounts:', results);
            // Flatten and sort by date
            const allTx = results.flat();
            this.transactions = allTx.sort((a, b) => 
              new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
            );
            this.loading = false;
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error fetching transactions', err);
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err: any) => {
        console.error('Error fetching accounts for transactions', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
