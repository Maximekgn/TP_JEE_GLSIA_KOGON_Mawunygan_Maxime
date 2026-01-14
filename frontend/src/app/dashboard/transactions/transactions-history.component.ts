import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService, Account, Transaction } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-transactions-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8">
      <!-- Header (Hidden on Print) -->
      <div class="space-y-2 print:hidden">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">
          Historique des Transactions
        </h2>
        <p class="text-slate-500">Consultez et imprimez les relevés de compte.</p>
      </div>

      <!-- Filter Form (Hidden on Print) -->
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:hidden"
      >
        <div class="p-8">
          <form
            [formGroup]="filterForm"
            (ngSubmit)="search()"
            class="grid grid-cols-1 md:grid-cols-4 gap-6 items-end"
          >
            <div class="space-y-2 md:col-span-1">
              <label class="block text-sm font-semibold text-slate-700">Compte</label>
              <select
                formControlName="accountId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">Choisir un compte</option>
                <option *ngFor="let acc of accounts$ | async" [value]="acc.id">
                  {{ acc.accountNumber }} - {{ acc.owner?.first_name }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Date Début</label>
              <input
                type="date"
                formControlName="startDate"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Date Fin</label>
              <input
                type="date"
                formControlName="endDate"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <div class="flex gap-2">
              <button
                type="submit"
                class="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                Rechercher
              </button>
              <button
                type="button"
                (click)="printStatement()"
                [disabled]="!selectedAccount || transactions.length === 0"
                class="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                Imprimer
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Results / Statement (Visible on Print) -->
      <div
        *ngIf="selectedAccount"
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:shadow-none print:border-none"
      >
        <!-- Statement Header (Only visible when account selected, specially styled for print) -->
        <div class="p-8 border-b border-gray-100">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold text-slate-900">Relevé de Compte</h1>
              <p class="text-slate-500 mt-1">
                Date d'édition: {{ currentDate | date: 'dd/MM/yyyy' }}
              </p>
            </div>
            <div class="text-right">
              <p class="font-bold text-lg">
                {{ selectedAccount.owner?.first_name }} {{ selectedAccount.owner?.last_name }}
              </p>
              <p class="text-slate-600">Compte: {{ selectedAccount.accountNumber }}</p>
              <p class="text-sm text-slate-500">Compte {{ selectedAccount.accountType }}</p>
            </div>
            <button
              (click)="downloadStatement()"
              class="ml-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors flex items-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6.72 13.89l-4.72-4.72m0 0l4.72-4.72M2 9.17h18a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H2.25A2.25 2.25 0 010 18.17V11.42a2.25 2.25 0 012.25-2.25z"
                />
              </svg>
              <span>Relevé (TXT)</span>
            </button>
          </div>

          <div class="mt-6 flex gap-8">
            <div>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >Solde Actuel</span
              >
              <p class="text-2xl font-bold text-blue-600">
                {{ selectedAccount.balance | number: '1.0-0' }} FCFA
              </p>
            </div>
            <div *ngIf="filterForm.value.startDate">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider"
                >Période</span
              >
              <p class="text-gray-700">
                Du {{ filterForm.value.startDate | date: 'dd/MM/yyyy' }} au
                {{ filterForm.value.endDate || currentDate | date: 'dd/MM/yyyy' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr
                class="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold"
              >
                <th class="px-8 py-4">Date</th>
                <th class="px-8 py-4">Type</th>
                <th class="px-8 py-4">Description</th>
                <th class="px-8 py-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let tx of transactions" class="hover:bg-slate-50/50">
                <td class="px-8 py-4 text-slate-600">
                  {{ tx.transactionDate | date: 'dd/MM/yyyy HH:mm' }}
                </td>
                <td class="px-8 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="{
                      'bg-green-100 text-green-800':
                        tx.transactionType === 'DEPOSIT' ||
                        (tx.transactionType === 'TRANSFER' &&
                          tx.destinationAccount?.id === selectedAccount.id),
                      'bg-red-100 text-red-800':
                        tx.transactionType === 'WITHDRAWAL' ||
                        (tx.transactionType === 'TRANSFER' &&
                          tx.sourceAccount?.id === selectedAccount.id),
                    }"
                  >
                    {{ tx.transactionType }}
                  </span>
                </td>
                <td class="px-8 py-4 text-slate-900 font-medium">
                  {{ tx.description }}
                  <span *ngIf="tx.transactionType === 'TRANSFER'">
                    <span *ngIf="tx.sourceAccount?.id === selectedAccount.id">
                      Vers: {{ tx.destinationAccount?.accountNumber }}
                    </span>
                    <span *ngIf="tx.destinationAccount?.id === selectedAccount.id">
                      De: {{ tx.sourceAccount?.accountNumber }}
                    </span>
                  </span>
                </td>
                <td
                  class="px-8 py-4 text-right font-bold"
                  [ngClass]="{
                    'text-green-600':
                      tx.transactionType === 'DEPOSIT' ||
                      (tx.transactionType === 'TRANSFER' &&
                        tx.destinationAccount?.id === selectedAccount.id),
                    'text-red-600':
                      tx.transactionType === 'WITHDRAWAL' ||
                      (tx.transactionType === 'TRANSFER' &&
                        tx.sourceAccount?.id === selectedAccount.id),
                  }"
                >
                  <span
                    *ngIf="
                      tx.transactionType === 'DEPOSIT' ||
                      (tx.transactionType === 'TRANSFER' &&
                        tx.destinationAccount?.id === selectedAccount.id)
                    "
                    >+</span
                  >
                  <span
                    *ngIf="
                      tx.transactionType === 'WITHDRAWAL' ||
                      (tx.transactionType === 'TRANSFER' &&
                        tx.sourceAccount?.id === selectedAccount.id)
                    "
                    >-</span
                  >
                  {{ tx.amount | number: '1.0-0' }} FCFA
                </td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="4" class="px-8 py-12 text-center text-slate-400">
                  Aucune transaction trouvée pour cette période.
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
          padding: 20px;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:shadow-none {
          box-shadow: none !important;
        }
        .print\\:border-none {
          border: none !important;
        }
      }
    `,
  ],
})
export class TransactionsHistoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);

  accounts$: Observable<Account[]> = of([]);
  transactions: Transaction[] = [];
  selectedAccount: Account | null = null;
  currentDate = new Date();

  filterForm: FormGroup = this.fb.group({
    accountId: ['', Validators.required],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    this.accounts$ = this.bankService.getAllAccounts();
  }

  search() {
    if (this.filterForm.invalid) return;

    const { accountId, startDate, endDate } = this.filterForm.value;

    // Find selected account object for display
    this.accounts$.subscribe((accounts) => {
      this.selectedAccount = accounts.find((a) => (a.id as any) == accountId) || null;
    });

    if (startDate && endDate) {
      // Backend expects ISO LocalDateTime: YYYY-MM-DDTHH:MM:SS
      const startIso = `${startDate}T00:00:00`;
      const endIso = `${endDate}T23:59:59`;

      this.bankService.getTransactionsByAccountDateRange(accountId, startIso, endIso).subscribe({
        next: (data) => (this.transactions = data),
        error: (err) => this.notificationService.showError('Erreur chargement historique'),
      });
    } else {
      // Fallback to all transactions if no date
      this.bankService.getTransactionsByAccount(accountId).subscribe({
        next: (data) => (this.transactions = data),
        error: (err) => this.notificationService.showError('Erreur chargement historique'),
      });
    }
  }

  downloadStatement() {
    if (this.filterForm.invalid) return;
    const { accountId, startDate, endDate } = this.filterForm.value;

    if (!startDate || !endDate) {
      this.notificationService.showError('Veuillez sélectionner une période pour le relevé.');
      return;
    }

    const startIso = `${startDate}T00:00:00`;
    const endIso = `${endDate}T23:59:59`;

    this.bankService.getAccountStatement(accountId, startIso, endIso).subscribe({
      next: (text) => {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `releve_compte_${this.selectedAccount?.accountNumber || accountId}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => this.notificationService.showError('Erreur lors de la génération du relevé'),
    });
  }

  printStatement() {
    window.print();
  }
}
