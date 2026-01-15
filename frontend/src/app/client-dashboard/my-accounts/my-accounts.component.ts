import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
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
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, {{ clientName }}</h1>
            <p class="text-slate-500 font-medium">Voici un aperçu de votre situation financière.</p>
        </div>
        <div class="flex gap-2">
            <button (click)="loadAccounts()" class="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                <svg [class.animate-spin]="loading" class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
            </button>
        </div>
      </header>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          class="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 relative overflow-hidden group"
        >
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div class="relative z-10">
              <div class="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div class="text-sm font-medium text-blue-100 mb-1">Nombre de comptes</div>
              <div class="text-4xl font-bold">{{ totalAccounts }}</div>
          </div>
        </div>

        <div
          class="bg-white rounded-3xl p-8 text-slate-900 shadow-xl shadow-slate-100 border border-slate-100 relative overflow-hidden group"
        >
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div class="relative z-10">
              <div class="p-3 bg-green-50 rounded-2xl w-fit mb-6">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-sm font-medium text-slate-400 mb-1">Solde Total</div>
              <div class="text-3xl font-bold text-slate-900">{{ totalBalance | number: '1.0-0' }} <span class="text-lg font-medium text-slate-400">FCFA</span></div>
          </div>
        </div>

        <div
          class="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden group"
        >
          <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <div class="relative z-10">
              <div class="p-3 bg-white/10 rounded-2xl w-fit mb-6">
                <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="text-sm font-medium text-slate-400 mb-1">Compte Principal</div>
              <div class="text-xl font-bold truncate">{{ mainAccountType }}</div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading && accounts.length === 0" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="relative w-16 h-16">
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="text-slate-500 font-medium animate-pulse">Chargement de vos comptes...</p>
      </div>

      <!-- Error State -->
      <div
        *ngIf="error && !loading"
        class="bg-red-50 border border-red-100 rounded-3xl p-12 text-center"
      >
        <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h3 class="text-xl font-bold text-red-900 mb-2">Erreur de chargement</h3>
        <p class="text-red-700 mb-8 max-w-sm mx-auto">{{ error }}</p>
        <button
          (click)="loadAccounts()"
          class="px-8 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 transition shadow-lg shadow-red-100"
        >
          Réessayer
        </button>
      </div>

      <!-- Empty State -->
      <div
        *ngIf="!loading && !error && accounts.length === 0"
        class="bg-slate-50 border border-slate-100 rounded-3xl p-24 text-center"
      >
        <div class="p-6 bg-white rounded-full w-fit mx-auto mb-6 shadow-sm">
            <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Aucun compte bancaire</h3>
        <p class="text-slate-500 mb-0 max-w-sm mx-auto">
          Vous n'avez pas encore de compte bancaire actif. Veuillez contacter votre conseiller pour l'ouverture d'un nouveau compte.
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
          class="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/50 border border-slate-100 relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer overflow-hidden"
          (click)="viewDetails(acc)"
        >
          <!-- Decorative element -->
          <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>

          <div class="relative z-10">
              <div class="flex justify-between items-start mb-10">
                <div
                  class="p-4 rounded-2xl transition-all duration-300 transform group-hover:scale-110 shadow-sm"
                  [class.bg-blue-50]="acc.accountType === 'COURANT'"
                  [class.text-blue-600]="acc.accountType === 'COURANT'"
                  [class.bg-emerald-50]="acc.accountType === 'EPARGNE'"
                  [class.text-emerald-600]="acc.accountType === 'EPARGNE'"
                  [class.bg-amber-50]="acc.accountType === 'ENTREPRISE'"
                  [class.text-amber-600]="acc.accountType === 'ENTREPRISE'"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-7 h-7"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>
                </div>
                <span
                  class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm"
                  [class.bg-blue-600]="acc.accountType === 'COURANT'"
                  [class.text-white]="acc.accountType === 'COURANT'"
                  [class.bg-emerald-600]="acc.accountType === 'EPARGNE'"
                  [class.text-white]="acc.accountType === 'EPARGNE'"
                  [class.bg-amber-600]="acc.accountType === 'ENTREPRISE'"
                  [class.text-white]="acc.accountType === 'ENTREPRISE'"
                >
                  {{ acc.accountType }}
                </span>
              </div>

              <div class="space-y-4">
                <div>
                    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Solde Disponible</p>
                    <h3 class="text-3xl font-extrabold text-slate-900 leading-none">
                      {{ acc.balance | number: '1.0-0' }} <span class="text-sm font-bold text-slate-400">FCFA</span>
                    </h3>
                </div>
                
                <div class="pt-4 border-t border-slate-50">
                    <p class="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mb-0.5">Numéro de Compte</p>
                    <p class="text-sm font-bold text-slate-700 font-mono">{{ acc.accountNumber }}</p>
                </div>
              </div>

              <!-- Action button (visible on hover or focus) -->
              <div class="mt-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  class="flex-1 px-4 py-3 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-2xl hover:bg-blue-100 transition shadow-sm"
                  (click)="$event.stopPropagation(); viewDetails(acc)"
                >
                  Détails
                </button>
                <button
                  class="flex-1 px-4 py-3 text-xs font-bold text-white bg-slate-900 rounded-2xl hover:bg-black transition shadow-lg"
                  (click)="$event.stopPropagation(); gotoOperations(acc)"
                >
                  Virement
                </button>
              </div>
          </div>
        </div>
      </div>

      <!-- Account Details View -->
      <div *ngIf="selectedAccount" class="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <!-- Details Header -->
        <div class="p-8 border-b border-slate-100 bg-slate-50/50">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center gap-6">
                    <button (click)="selectedAccount = null" class="p-3 bg-white hover:bg-slate-50 rounded-2xl transition shadow-sm border border-slate-100">
                        <svg class="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div class="space-y-1">
                        <h2 class="text-2xl font-black text-slate-900">Détails du Compte</h2>
                        <p class="text-sm text-slate-500 font-mono uppercase tracking-widest">{{ selectedAccount.accountNumber }}</p>
                    </div>
                </div>
                <div class="bg-blue-600 p-6 md:px-8 md:py-4 rounded-3xl text-white shadow-xl shadow-blue-100">
                    <p class="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Solde Actuel</p>
                    <p class="text-3xl font-black">{{ selectedAccount.balance | number:'1.0-0' }} <span class="text-sm font-medium opacity-80">FCFA</span></p>
                </div>
            </div>
        </div>

        <!-- Transactions History -->
        <div class="p-8">
          <div class="flex items-center justify-between mb-8">
              <h3 class="text-xl font-black text-slate-900">Activité Récente</h3>
              <button (click)="loadTransactions(selectedAccount.id)" class="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition">
                  Rafraîchir
              </button>
          </div>
          
          <div *ngIf="loadingTransactions" class="py-24 text-center">
            <div class="relative w-12 h-12 mx-auto mb-6">
                <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
                <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-slate-400 font-medium">Chargement des transactions...</p>
          </div>

          <div *ngIf="!loadingTransactions && transactions.length === 0" class="py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 mx-auto max-w-lg">
             <div class="p-4 bg-white rounded-full w-fit mx-auto mb-4 shadow-sm">
                <svg class="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
             <p class="text-slate-500 font-medium">Aucune activité enregistrée sur ce compte.</p>
          </div>

          <div *ngIf="!loadingTransactions && transactions.length > 0" class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                  <th class="pb-6 pr-4">Horodatage</th>
                  <th class="pb-6 pr-4">Désignation</th>
                  <th class="pb-6 pr-4">Catégorie</th>
                  <th class="pb-6 text-right">Variations</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let t of transactions" class="group hover:bg-slate-50/50 transition-colors">
                  <td class="py-6 pr-4 text-xs font-bold text-slate-500">
                    {{ t.transactionDate | date:'dd MMM yyyy HH:mm' }}
                  </td>
                  <td class="py-6 pr-4">
                    <span class="text-sm font-bold text-slate-800">{{ t.description }}</span>
                    <div class="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">REF: TXN-{{ t.id }}</div>
                  </td>
                  <td class="py-6 pr-4">
                    <span [class]="'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ' + (
                      t.transactionType === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-700' :
                      t.transactionType === 'WITHDRAWAL' ? 'bg-rose-100 text-rose-700' :
                      'bg-blue-100 text-blue-700'
                    )">
                      {{ t.transactionType }}
                    </span>
                  </td>
                  <td class="py-6 text-right">
                    <div [class]="'text-sm font-black ' + (
                      t.transactionType === 'DEPOSIT' ? 'text-emerald-600' :
                      t.transactionType === 'WITHDRAWAL' ? 'text-rose-600' :
                      'text-blue-600'
                    )">
                      {{ (t.transactionType === 'DEPOSIT' ? '+' : '-') }} {{ t.amount | number:'1.0-0' }} <span class="text-[10px] font-normal text-slate-400 ml-1">FCFA</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class MyAccountsComponent implements OnInit {
  private clientAuthService = inject(ClientAuthService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

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
    this.cdr.detectChanges();

    this.http
      .get<Account[]>('/api/client/accounts')
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
        },
      });
  }

  viewDetails(account: Account): void {
    this.selectedAccount = account;
    this.loadTransactions(account.id);
  }

  loadTransactions(accountId: number): void {
    this.loadingTransactions = true;
    this.cdr.detectChanges();
    this.http
      .get<Transaction[]>(`/api/client/accounts/${accountId}/transactions`)
      .pipe(
        finalize(() => {
          this.loadingTransactions = false;
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          console.error('Error loading transactions:', err);
          return of([]);
        }),
      )
      .subscribe({
        next: (transactions) => {
          this.transactions = transactions;
          this.cdr.detectChanges();
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
