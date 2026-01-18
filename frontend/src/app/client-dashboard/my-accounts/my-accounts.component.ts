import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCreditCard,
  heroCurrencyDollar,
  heroShieldCheck,
  heroArrowPath,
  heroExclamationCircle,
  heroInboxStack,
  heroChevronLeft,
  heroInformationCircle,
  heroArrowsRightLeft
} from '@ng-icons/heroicons/outline';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  imports: [CommonModule, NgIcon],
  viewProviders: [
    provideIcons({
      heroCreditCard,
      heroCurrencyDollar,
      heroShieldCheck,
      heroArrowPath,
      heroExclamationCircle,
      heroInboxStack,
      heroChevronLeft,
      heroInformationCircle,
      heroArrowsRightLeft
    })
  ],
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
                <ng-icon name="heroArrowPath" [class.animate-spin]="loading" size="1.25rem" class="text-slate-600"></ng-icon>
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
                <ng-icon name="heroCreditCard" size="1.5rem" class="text-white"></ng-icon>
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
                <ng-icon name="heroCurrencyDollar" size="1.5rem" class="text-green-600"></ng-icon>
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
                <ng-icon name="heroShieldCheck" size="1.5rem" class="text-blue-400"></ng-icon>
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
            <ng-icon name="heroExclamationCircle" size="2rem" class="text-red-600"></ng-icon>
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
            <ng-icon name="heroInboxStack" size="3rem" class="text-slate-300"></ng-icon>
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
                  <ng-icon name="heroCreditCard" size="1.75rem"></ng-icon>
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
                  class="flex-1 px-4 py-3 text-xs font-bold text-white bg-slate-900 rounded-2xl hover:bg-black transition shadow-lg flex items-center justify-center gap-2"
                  (click)="$event.stopPropagation(); gotoOperations(acc)"
                >
                  <ng-icon name="heroArrowsRightLeft" size="0.875rem"></ng-icon>
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
                        <ng-icon name="heroChevronLeft" size="1.5rem" class="text-slate-600"></ng-icon>
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
              <button (click)="loadTransactions(selectedAccount.id)" class="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition flex items-center gap-2">
                  <ng-icon name="heroArrowPath" size="0.875rem"></ng-icon>
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
                <ng-icon name="heroInformationCircle" size="2rem" class="text-slate-300"></ng-icon>
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
    this.router.navigate(['/client/dashboard/operations'], {
      queryParams: { accountId: account.id },
    });
  }
}
