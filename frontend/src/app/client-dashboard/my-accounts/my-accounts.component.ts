import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

interface Account {
  id: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  createdAt: string;
  owner?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

interface Transaction {
  id: number;
  amount: number;
  transactionType: string;
  transactionDate: string;
  description: string;
  sourceAccount?: { accountNumber: string };
  destinationAccount?: { accountNumber: string };
}

@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Header -->
      <header class="space-y-2">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, {{ clientName }}</h1>
        <p class="text-slate-500">Voici un aperçu de vos comptes et solde actuel.</p>
      </header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium opacity-90">Total des comptes</div>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ totalAccounts }}</div>
        </div>

        <div
          class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium opacity-90">Solde total</div>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div class="text-3xl font-bold">{{ totalBalance | number: '1.2-2' }} FCFA</div>
        </div>

        <div
          class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm font-medium opacity-90">Compte principal</div>
            <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <div class="text-lg font-bold truncate">{{ mainAccountType }}</div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <svg
            class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p class="text-slate-500">Chargement de vos comptes...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        *ngIf="error && !loading"
        class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <svg
          class="w-12 h-12 text-red-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-red-800 font-medium mb-2">Erreur de chargement</p>
        <p class="text-red-600 text-sm mb-4">{{ error }}</p>
        <button
          (click)="loadAccounts()"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Réessayer
        </button>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading && !error && accounts.length === 0"
        class="bg-slate-50 border border-slate-200 rounded-lg p-12 text-center"
      >
        <svg
          class="w-16 h-16 text-slate-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 class="text-lg font-semibold text-slate-900 mb-2">Aucun compte bancaire</h3>
        <p class="text-slate-500 mb-6">
          Vous n'avez pas encore de compte bancaire. Contactez votre agence pour en ouvrir un.
        </p>
      </div>

      <!-- Accounts Grid -->
      <div
        *ngIf="!loading && !error && accounts.length > 0 && !selectedAccount"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <!-- Account Card -->
        <div
          *ngFor="let acc of accounts"
          class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          (click)="viewDetails(acc)"
        >
          <div class="flex justify-between items-start mb-8">
            <div
              class="p-3 rounded-2xl transition-colors"
              [class.bg-blue-50]="acc.accountType === 'COURANT'"
              [class.text-blue-600]="acc.accountType === 'COURANT'"
              [class.bg-green-50]="acc.accountType === 'EPARGNE'"
              [class.text-green-600]="acc.accountType === 'EPARGNE'"
              [class.bg-purple-50]="acc.accountType === 'ENTREPRISE'"
              [class.text-purple-600]="acc.accountType === 'ENTREPRISE'"
              [class.group-hover:bg-blue-600]="acc.accountType === 'COURANT'"
              [class.group-hover:bg-green-600]="acc.accountType === 'EPARGNE'"
              [class.group-hover:bg-purple-600]="acc.accountType === 'ENTREPRISE'"
              [class.group-hover:text-white]="true"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-8 h-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                />
              </svg>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
              [class.bg-blue-100]="acc.accountType === 'COURANT'"
              [class.text-blue-700]="acc.accountType === 'COURANT'"
              [class.bg-green-100]="acc.accountType === 'EPARGNE'"
              [class.text-green-700]="acc.accountType === 'EPARGNE'"
              [class.bg-purple-100]="acc.accountType === 'ENTREPRISE'"
              [class.text-purple-700]="acc.accountType === 'ENTREPRISE'"
            >
              {{ acc.accountType }}
            </span>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-400 mb-1">Solde Disponible</p>
            <h3 class="text-3xl font-bold text-slate-900">
              {{ acc.balance | number: '1.2-2' }} <span class="text-lg text-slate-400">FCFA</span>
            </h3>
            <p class="text-xs text-slate-400 mt-4 font-mono">{{ acc.accountNumber }}</p>
            <p class="text-xs text-slate-400 mt-1">
              Créé le {{ acc.createdAt | date: 'dd/MM/yyyy' }}
            </p>
          </div>

          <!-- Quick Actions -->
          <div class="mt-6 pt-6 border-t border-slate-100 flex gap-2">
            <button
              class="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              (click)="$event.stopPropagation(); viewDetails(acc)"
            >
              Détails
            </button>
            <button
              class="flex-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
              (click)="$event.stopPropagation(); gotoOperations(acc)"
            >
              Opérations
            </button>
          </div>
        </div>
      </div>

      <!-- Account Details View -->
      <div *ngIf="selectedAccount" class="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <!-- Details Header -->
        <div class="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div class="flex items-center gap-4">
            <button (click)="selectedAccount = null" class="p-2 hover:bg-white rounded-full transition shadow-sm border border-slate-200">
              <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 class="text-xl font-bold text-slate-900">Détails du compte</h2>
              <p class="text-sm text-slate-500 font-mono">{{ selectedAccount.accountNumber }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Solde Actuel</p>
            <p class="text-2xl font-bold text-indigo-600">{{ selectedAccount.balance | number:'1.2-2' }} FCFA</p>
          </div>
        </div>

        <!-- Transactions History -->
        <div class="p-6">
          <h3 class="text-lg font-bold text-slate-800 mb-4">Dernières transactions</h3>
          
          <div *ngIf="loadingTransactions" class="py-12 text-center">
            <div class="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-2"></div>
            <p class="text-slate-400 text-sm">Chargement de l'historique...</p>
          </div>

          <div *ngIf="!loadingTransactions && transactions.length === 0" class="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p class="text-slate-500">Aucune transaction trouvée pour ce compte.</p>
          </div>

          <div *ngIf="!loadingTransactions && transactions.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th class="pb-3 pr-4">Date</th>
                  <th class="pb-3 pr-4">Type</th>
                  <th class="pb-3 pr-4">Description</th>
                  <th class="pb-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let t of transactions" class="group hover:bg-slate-50/50 transition-colors">
                  <td class="py-4 pr-4 text-sm text-slate-600">
                    {{ t.transactionDate | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="py-4 pr-4">
                    <span [class]="'px-2 py-1 rounded-md text-[10px] font-bold uppercase ' + (
                      t.transactionType === 'DEPOSIT' ? 'bg-green-100 text-green-700' :
                      t.transactionType === 'WITHDRAWAL' ? 'bg-red-100 text-red-700' :
                      'bg-indigo-100 text-indigo-700'
                    )">
                      {{ t.transactionType }}
                    </span>
                  </td>
                  <td class="py-4 pr-4 text-sm text-slate-600">
                    {{ t.description }}
                  </td>
                  <td class="py-4 text-right">
                    <span [class]="'font-bold ' + (
                      t.transactionType === 'DEPOSIT' ? 'text-green-600' :
                      t.transactionType === 'WITHDRAWAL' ? 'text-red-600' :
                      'text-indigo-600'
                    )">
                      {{ (t.transactionType === 'DEPOSIT' ? '+' : '-') }} {{ t.amount | number:'1.2-2' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
      }
    `,
  ],
})
export class MyAccountsComponent implements OnInit {
  private clientAuthService = inject(ClientAuthService);
  private http = inject(HttpClient);
  private router = inject(Router);

  clientName: string = '';
  accounts: Account[] = [];
  loading = false;
  error: string | null = null;

  // Selected account for details
  selectedAccount: Account | null = null;
  transactions: Transaction[] = [];
  loadingTransactions = false;

  // Computed properties
  get totalAccounts(): number {
    return this.accounts.length;
  }

  get totalBalance(): number {
    return this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }

  get mainAccountType(): string {
    if (this.accounts.length === 0) return 'Aucun';
    // Return the first account type or the one with highest balance
    const mainAccount = this.accounts.reduce((max, acc) => (acc.balance > max.balance ? acc : max));
    return mainAccount.accountType;
  }

  ngOnInit(): void {
    this.clientName = this.clientAuthService.getUserFirstName() || 'Client';
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    // Use /api/client/accounts which is more secure (gets ID from token)
    this.http
      .get<Account[]>('/api/client/accounts')
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        catchError((err) => {
          console.error('Error loading accounts:', err);
          this.error = err.error?.message || err.message || 'Impossible de charger vos comptes';
          return of([]);
        }),
      )
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          console.log('Loaded accounts:', accounts);
        },
      });
  }

  viewDetails(account: Account): void {
    this.selectedAccount = account;
    this.loadTransactions(account.id);
  }

  loadTransactions(accountId: number): void {
    this.loadingTransactions = true;
    this.http
      .get<Transaction[]>(`/api/client/accounts/${accountId}/transactions`)
      .pipe(
        finalize(() => {
          this.loadingTransactions = false;
        }),
        catchError((err) => {
          console.error('Error loading transactions:', err);
          return of([]);
        }),
      )
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
        },
      });
  }

  gotoOperations(account: Account): void {
    // Navigate to operations with selected account
    this.router.navigate(['/client/dashboard/operations'], {
      queryParams: { accountId: account.id },
    });
  }
}
