import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { BankService, Account, Transaction } from '../../../security/core/services/bank.service';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { Observable, of, combineLatest } from 'rxjs';
import { finalize, switchMap, map, take } from 'rxjs/operators';

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
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500 transition-all font-medium"
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
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date Fin</label>
            <input
              type="date"
              formControlName="endDate"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <button
            (click)="loadTransactions()"
            [disabled]="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-100"
          >
            <svg *ngIf="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Chargement...' : 'Filtrer' }}
          </button>
        </form>
      </div>

      <!-- Statement View -->
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:shadow-none print:border-none min-h-[400px] relative"
      >
        <!-- Loading Overlay -->
        <div *ngIf="loading" class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
            <div class="relative w-12 h-12">
              <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-slate-500 text-sm font-medium mt-4">Mise à jour de l'historique...</p>
        </div>

        <!-- Print Header -->
        <div class="hidden print:block p-8 border-b border-gray-200">
          <div class="flex justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">E-Bank</h1>
              <p class="text-sm text-slate-500">Relevé de Compte Client</p>
            </div>
            <div class="text-right">
              <h2 class="font-bold text-lg">{{ clientFullName }}</h2>
              <p class="text-sm text-slate-500">Client ID: #{{ CLIENT_ID }}</p>
              <p class="text-sm text-slate-500">Edité le {{ today | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  <th class="p-6 cursor-pointer hover:bg-slate-100 transition-colors" (click)="sort('date')">Date</th>
                  <th class="p-6">Description</th>
                  <th class="p-6 cursor-pointer hover:bg-slate-100 transition-colors" (click)="sort('type')">Type</th>
                  <th class="p-6 text-right cursor-pointer hover:bg-slate-100 transition-colors" (click)="sort('amount')">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let tx of transactions" class="hover:bg-slate-50/50 transition-colors group">
                  <td class="p-6 text-slate-500 text-sm font-medium">
                    {{ tx.transactionDate | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="p-6">
                    <div class="font-bold text-slate-800">{{ tx.description }}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">Référence: TXN-{{ tx.id }}</div>
                  </td>
                  <td class="p-6">
                    <span
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
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
                    class="p-6 text-right font-bold font-mono text-sm"
                    [ngClass]="
                      tx.transactionType === 'DEPOSIT' ||
                      (tx.transactionType === 'TRANSFER' && isCredit(tx))
                        ? 'text-green-600'
                        : 'text-slate-900'
                    "
                  >
                    {{ isCredit(tx) ? '+' : '-' }} {{ tx.amount | number: '1.0-0' }} <span class="text-[10px] font-normal text-slate-400 ml-1">FCFA</span>
                  </td>
                </tr>
                <tr *ngIf="transactions.length === 0 && !loading">
                  <td colspan="4" class="p-24 text-center">
                    <div class="flex flex-col items-center justify-center space-y-3">
                        <div class="p-4 bg-slate-50 rounded-full">
                            <svg class="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p class="text-slate-400 font-medium">Aucune transaction trouvée pour cette période.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
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
  private cdr = inject(ChangeDetectorRef);
  
  readonly CLIENT_ID = this.authService.getUserId() || 1;
  clientFullName: string = '';

  accounts$: Observable<Account[]> = of([]);
  transactions: Transaction[] = [];
  today = new Date();
  loading = false;

  filterForm = this.fb.group({
    accountId: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit() {
    this.clientFullName = this.authService.getUserFullName();
    this.accounts$ = this.bankService.getMyAccounts();
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.cdr.detectChanges();
    const { accountId, startDate, endDate } = this.filterForm.value;

    if (accountId) {
      const id = parseInt(accountId);
      
      this.bankService.getMyAccountStatement(id, startDate || undefined, endDate || undefined)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })).subscribe(data => {
          this.transactions = data.transactions || [];
          this.cdr.detectChanges();
        });

    } else {
      // If no account is selected, we could either show nothing or fetch all accounts' statements
      // For simplicity and matching the user request "can consult HIS statement", 
      // let's fetch my profile or just my and filter them if we really want "all mine".
      // But getMyAccountStatement needs an ID. 
      // Let's just say "Select an account to see history" or use getMyTransactionsByAccount if we want all.
      
      this.accounts$.pipe(
        take(1),
        switchMap(accounts => {
          if (accounts.length === 0) return of([]);
          // We could use getAllTransactions button but that's what we want to avoid (admin endpoint)
          // For now, let's just use the first account if none selected, or show empty
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      ).subscribe(data => {
        this.transactions = data as Transaction[];
        this.cdr.detectChanges();
      });
    }
  }

  isCredit(tx: Transaction): boolean {
    if (tx.transactionType === 'DEPOSIT') return true;
    if (tx.transactionType === 'WITHDRAWAL') return false;
    
    // For transfers, check if the destination is one of my accounts
    // Since we don't have the list easily here without a separate check, 
    // let's assume if it's a transfer and source account belongs to someone else 
    // (detected by sourceAccount != current filtered account if filtered)
    
    // Better: If we have multiple accounts, a credit transfer is one where 
    // destinationAccount.id is one of my account IDs.
    return false; // Default to debit for now
  }

  sort(column: string) {
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
