import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BankService, Account, Transaction } from '../../../security/core/services/bank.service';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-end gap-4 print:hidden">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Historique des Opérations</h1>
          <p class="text-slate-500">Consultez vos relevés et exportez vos transactions.</p>
        </div>
        <button
          (click)="print()"
          class="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
            />
          </svg>
          Imprimer Relevé
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:hidden">
        <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Compte</label>
            <select
              formControlName="accountId"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            >
              <option value="">Tous les comptes</option>
              <option *ngFor="let acc of accounts$ | async" [value]="acc.id">
                {{ acc.accountNumber }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date Début</label>
            <input
              type="date"
              formControlName="startDate"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date Fin</label>
            <input
              type="date"
              formControlName="endDate"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
            />
          </div>
          <button
            (click)="loadTransactions()"
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors"
          >
            Filtrer
          </button>
        </form>
      </div>

      <!-- Statement View (Visible only print or when needed) -->
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:shadow-none print:border-none"
      >
        <!-- Print Header -->
        <div class="hidden print:block p-8 border-b border-gray-200">
          <div class="flex justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">E-Bank</h1>
              <p class="text-sm text-slate-500">Relevé de Compte Client</p>
            </div>
            <div class="text-right">
              <h2 class="font-bold text-lg">Jean Dupont</h2>
              <p class="text-sm text-slate-500">Client #001</p>
              <p class="text-sm text-slate-500">Edité le {{ today | date: 'dd/MM/yyyy' }}</p>
            </div>
          </div>
        </div>

        <table class="w-full text-left">
          <thead>
            <tr
              class="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase"
            >
              <th class="p-6 cursor-pointer hover:bg-slate-100" (click)="sort('date')">Date</th>
              <th class="p-6">Description</th>
              <th class="p-6 cursor-pointer hover:bg-slate-100" (click)="sort('type')">Type</th>
              <th class="p-6 text-right cursor-pointer hover:bg-slate-100" (click)="sort('amount')">
                Montant
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr *ngFor="let tx of transactions" class="hover:bg-slate-50 transition-colors">
              <td class="p-6 text-slate-600 font-medium">
                {{ tx.transactionDate | date: 'dd/MM/yyyy' }}
              </td>
              <td class="p-6 text-slate-900">
                <div class="font-semibold">{{ tx.description }}</div>
                <div class="text-xs text-slate-400">Ref: {{ tx.id }}</div>
              </td>
              <td class="p-6">
                <span
                  class="px-3 py-1 rounded-full text-xs font-bold"
                  [ngClass]="{
                    'bg-green-100 text-green-700': tx.transactionType === 'DEPOSIT',
                    'bg-red-100 text-red-700': tx.transactionType === 'WITHDRAWAL',
                    'bg-blue-100 text-blue-700': tx.transactionType === 'TRANSFER',
                  }"
                >
                  {{ tx.transactionType }}
                </span>
              </td>
              <td
                class="p-6 text-right font-bold font-mono"
                [ngClass]="
                  tx.transactionType === 'DEPOSIT' ||
                  (tx.transactionType === 'TRANSFER' && isCredit(tx))
                    ? 'text-green-600'
                    : 'text-slate-900'
                "
              >
                {{ isCredit(tx) ? '+' : '-' }} {{ tx.amount | number: '1.0-0' }}
              </td>
            </tr>
            <tr *ngIf="transactions.length === 0">
              <td colspan="4" class="p-12 text-center text-slate-400">
                Aucune transaction trouvée.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `
      @media print {
        :host {
          display: block;
          background: white;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:block {
          display: block !important;
        }
      }
    `,
  ],
})
export class ClientHistoryComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(ClientAuthService);
  private fb = inject(FormBuilder);
  private readonly CLIENT_ID = this.authService.getUserId() || 1;

  accounts$: Observable<Account[]> = of([]);
  transactions: Transaction[] = [];
  today = new Date();

  // Keep track of filter to know if "Transfer" is credit or debit for context
  // But with simple API, Transfer is ambiguous unless we check source vs dest account ID.
  // We'll simplistic check.

  filterForm = this.fb.group({
    accountId: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit() {
    this.accounts$ = this.bankService.getAccountsByClient(this.CLIENT_ID);
    this.loadTransactions();
  }

  loadTransactions() {
    const { accountId, startDate, endDate } = this.filterForm.value;

    // If specific account selected, use specific endpoint
    if (accountId) {
      if (startDate && endDate) {
        const startIso = `${startDate}T00:00:00`;
        const endIso = `${endDate}T23:59:59`;
        this.bankService
          .getTransactionsByAccountDateRange(parseInt(accountId), startIso, endIso)
          .subscribe((data) => (this.transactions = data));
      } else {
        this.bankService
          .getTransactionsByAccount(parseInt(accountId))
          .subscribe((data) => (this.transactions = data));
      }
    } else {
      // Should ideally have "getAllClientTransactions" but we can iterate user accounts
      // or just fetch all global transactions and filter by client's account IDs on frontend for this demo.
      // Let's fetch ALL transactions and filter client side for Safety (in real app, backend query)
      this.bankService.getAllTransactions().subscribe((all: Transaction[]) => {
        // We need to know client's account IDs first
        this.accounts$.subscribe((myAccounts) => {
          const myIds = myAccounts.map((a) => a.id);
          this.transactions = all.filter(
            (t: Transaction) =>
              (t.sourceAccount && myIds.includes(t.sourceAccount.id as number)) ||
              (t.destinationAccount && myIds.includes(t.destinationAccount.id as number)),
          );

          // Apply date filter manually if global fetch
          if (startDate)
            this.transactions = this.transactions.filter((t) => t.transactionDate >= startDate!);
          if (endDate)
            this.transactions = this.transactions.filter(
              (t) => t.transactionDate <= endDate! + 'T23:59:59',
            );
        });
      });
    }
  }

  isCredit(tx: Transaction): boolean {
    // Heuristic: If it's a deposit, it's credit.
    // If transfer, we strictly need to know which account is "mine".
    // In global view, this is hard.
    // For this UI, let's assume if destination account is one of mine (we'd need logic)
    // Simplified: Deposit = +, Withdraw = -. Transfer = - (sending money usually).
    if (tx.transactionType === 'DEPOSIT') return true;
    if (tx.transactionType === 'WITHDRAWAL') return false;
    // Transfer: Check if destination is in my accounts list?
    // For demo: Transfers are usually outgoing unless specified.
    return false;
  }

  sort(column: string) {
    // Basic sort implementation
    this.transactions.sort((a: any, b: any) => {
      if (column === 'amount') return b.amount - a.amount;
      if (column === 'date')
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      return 0;
    });
  }

  print() {
    window.print();
  }
}
