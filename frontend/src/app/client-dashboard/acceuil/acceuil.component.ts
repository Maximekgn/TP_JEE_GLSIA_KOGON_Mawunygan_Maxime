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
  heroArrowsRightLeft,
  heroHome,
  heroPlus,
  heroArrowDownLeft,
  heroArrowUpRight,
  heroClock
} from '@ng-icons/heroicons/outline';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { BankService, Account, Transaction } from '../../../security/core/services/bank.service';
import type { Transaction as DetailedTransaction } from '../../shared/components/transaction-details/transaction-details.component';

@Component({
  selector: 'app-acceuil',
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
      heroArrowsRightLeft,
      heroHome,
      heroPlus,
      heroArrowDownLeft,
      heroArrowUpRight,
      heroClock
    })
  ],
  template: `
    <div class="space-y-8 pb-12">
      <!-- Header -->
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="space-y-2">
            <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Ravi de vous revoir, {{ clientName }} 👋</h1>
            <p class="text-slate-500 text-lg font-medium">Consultez l'état de vos comptes en un coup d'œil.</p>
        </div>
        <div class="flex gap-3">
             <button (click)="goToNewTransfer()" class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 group">
                <ng-icon name="heroPlus" size="1.25rem"></ng-icon>
                Nouveau Virement
            </button>
            <button (click)="loadAccounts()" class="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm group" title="Actualiser">
                <ng-icon name="heroArrowPath" [class.animate-spin]="loading" size="1.25rem" class="text-slate-600 group-hover:text-blue-600"></ng-icon>
            </button>
        </div>
      </header>

      <!-- Loading State -->
      <div *ngIf="loading && accounts.length === 0" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="relative w-16 h-16">
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="text-slate-500 font-medium animate-pulse">Chargement de vos comptes...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !loading" class="bg-red-50 border border-red-100 p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ng-icon name="heroExclamationCircle" size="2rem" class="text-red-600"></ng-icon>
        </div>
        <h3 class="text-xl font-bold text-red-900 mb-2">Erreur de chargement</h3>
        <p class="text-red-700 mb-8 max-w-sm mx-auto">{{ error }}</p>
        <button (click)="loadAccounts()" class="px-8 py-3 bg-red-600 text-white font-bold  hover:bg-red-700 transition shadow-lg shadow-red-200">
          Réessayer
        </button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && accounts.length === 0" class="bg-slate-50 border border-slate-100 p-24 text-center max-w-2xl mx-auto">
        <div class="p-6 bg-white rounded-full w-fit mx-auto mb-6 shadow-sm">
            <ng-icon name="heroInboxStack" size="3rem" class="text-slate-300"></ng-icon>
        </div>
        <h3 class="text-xl font-bold text-slate-900 mb-2">Aucun compte bancaire</h3>
        <p class="text-slate-500 mb-0 max-w-sm mx-auto text-balance">
          Vous n'avez pas encore de compte bancaire actif. Veuillez contacter votre banque pour l'ouverture d'un nouveau compte.
        </p>
      </div>

      <!-- Accounts Grid -->
      <div *ngIf="!loading && !error && accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          *ngFor="let acc of accounts"
          class="bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative  cursor-pointer overflow-hidden flex flex-col min-h-[280px]"
          (click)="viewDetails(acc)"
        >
          <!-- Background Decoration -->
          <div class="absolute -right-12 -top-12 w-48 h-48 rounded-full transition-all duration-700  opacity-10 "
            [class.bg-blue-600]="acc.accountType === 'COURANT'"
            [class.bg-emerald-600]="acc.accountType === 'EPARGNE'"
            [class.bg-slate-900]="acc.accountType === 'ENTREPRISE'"
          ></div>

          <div class="relative z-10 flex flex-col h-full">
            <div class="flex justify-between items-start mb-10">
              <div
                class="p-4 rounded-2xl transition-all duration-300 transform  shadow-sm"
                [class.bg-blue-50]="acc.accountType === 'COURANT'"
                [class.text-blue-600]="acc.accountType === 'COURANT'"
                [class.bg-emerald-50]="acc.accountType === 'EPARGNE'"
                [class.text-emerald-600]="acc.accountType === 'EPARGNE'"
                [class.bg-slate-50]="acc.accountType === 'ENTREPRISE'"
                [class.text-slate-900]="acc.accountType === 'ENTREPRISE'"
              >
                <ng-icon name="heroCreditCard" size="2rem"></ng-icon>
              </div>
              <span
                class="px-5 py-2 rounded-full text-[10px] text-white uppercase tracking-widest transition-colors shadow-sm"
                [class.bg-blue-600]="acc.accountType === 'COURANT'"
                [class.bg-emerald-600]="acc.accountType === 'EPARGNE'"
                [class.bg-slate-900]="acc.accountType === 'ENTREPRISE'"
              >
                <span class="text-white">{{ acc.accountType }}</span>
              </span>
            </div>

            <div class="space-y-6 mt-auto">
              <div>
                  <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Solde Disponible</p>
                  <h3 class="text-4xl font-black text-slate-900 leading-none tracking-tight">
                    {{ acc.balance | number: '1.0-0' }} <span class="text-sm font-bold text-slate-400 ml-1">FCFA</span>
                  </h3>
              </div>
              
              <div class="pt-5 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p class="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mb-0.5">Numéro de Compte</p>
                  <p class="text-sm font-bold text-slate-700 font-mono">{{ acc.accountNumber }}</p>
                </div>
                <div class="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <ng-icon name="heroChevronLeft" size="1rem" class="rotate-180 text-slate-400 group-hover:text-white transition-colors"></ng-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity & Illustration Section -->
      <div class="flex flex-col lg:flex-row items-stretch justify-between w-full mt-20 gap-12">
        <!-- Recent Activities -->
        <div class="w-full lg:w-1/2 flex flex-col">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">Activités Récentes</h2>
            <button (click)="gotoHistory()" class="group flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
              Voir tout l'historique
              <ng-icon name="heroChevronLeft" size="0.9rem" class="rotate-180 group-hover:translate-x-1 transition-transform"></ng-icon>
            </button>
          </div>

          <div *ngIf="loadingTransactions" class="flex flex-col items-center justify-center py-12 space-y-3">
              <div class="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              <p class="text-xs text-slate-400 font-medium tracking-wider">Récupération des opérations...</p>
          </div>

          <div *ngIf="!loadingTransactions && recentTransactions.length === 0" class="p-12 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
              <p class="text-slate-400 font-medium">Aucune activité enregistrée.</p>
          </div>

          <div class="space-y-4" *ngIf="!loadingTransactions && recentTransactions.length > 0">
            <div *ngFor="let tx of recentTransactions" 
                 (click)="viewTransactionDetails(tx)"
                 class="flex items-center gap-4 p-5 bg-white border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 group cursor-pointer relative overflow-hidden">
              <div class="p-4 rounded-2xl transition-all duration-300 shadow-sm"
                   [ngClass]="{
                     'bg-emerald-50 text-emerald-600': tx.transactionType === 'DEPOSIT',
                     'bg-blue-50 text-blue-600': tx.transactionType === 'TRANSFER',
                     'bg-rose-50 text-rose-600': tx.transactionType === 'WITHDRAWAL'
                   }">
                <ng-icon [name]="getTransactionIcon(tx)" size="1.5rem"></ng-icon>
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{{ tx.description || tx.transactionType }}</h4>
                <div class="flex items-center gap-2 mt-1">
                  <ng-icon name="heroClock" size="0.8rem" class="text-slate-300"></ng-icon>
                  <p class="text-xs text-slate-400 font-semibold uppercase tracking-wider">{{ tx.transactionDate | date:'dd MMM yyyy' }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-black tracking-tight"
                   [class.text-emerald-600]="tx.transactionType === 'DEPOSIT'"
                   [class.text-slate-900]="tx.transactionType !== 'DEPOSIT'">
                  {{ tx.transactionType === 'DEPOSIT' ? '+' : '-' }}{{ tx.amount | number }} 
                  <span class="text-[10px] font-bold text-slate-400 ml-0.5">FCFA</span>
                </p>
                <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mt-0.5 block">Ref: TXN-{{ tx.id }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Illustration -->
        <div class="w-full lg:w-1/2 flex items-center justify-center p-12 bg-slate-50/50 rounded-[3.5rem] border border-slate-100 relative group overflow-hidden min-h-[400px]">
          <div class="absolute top-0 right-0 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-20 -mr-40 -mt-40 transition-all duration-700 "></div>
          <div class="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-20 -ml-40 -mb-40 transition-all duration-700 "></div>
          
          <img src="acceuil.svg" alt="Tableau de bord" class="w-full max-w-md h-auto object-contain relative z-10 transition-all duration-700 animate-float drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    .animate-float {
      animation: float 6s ease-in-out infinite;
    }
  `],
})
export class AcceuilComponent implements OnInit {
  private clientAuthService = inject(ClientAuthService);
  private bankService = inject(BankService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  clientName: string = '';
  accounts: Account[] = [];
  recentTransactions: Transaction[] = [];
  loading = false;
  loadingTransactions = false;
  error: string | null = null;

  ngOnInit(): void {
    this.clientName = this.clientAuthService.getUserFirstName() || 'Client';
    this.loadAccounts();
    this.loadRecentTransactions();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.bankService.getMyAccounts()
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

  loadRecentTransactions(): void {
    this.loadingTransactions = true;
    this.cdr.detectChanges();

    this.bankService.getMyAllTransactions()
      .pipe(
        finalize(() => {
          this.loadingTransactions = false;
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          console.error('Error loading transactions:', err);
          return of([]);
        })
      )
      .subscribe(transactions => {
        // Take last 8 transactions
        this.recentTransactions = transactions.slice(0, 8);
        this.cdr.detectChanges();
      });
  }

  getTransactionIcon(t: Transaction): string {
    switch (t.transactionType) {
      case 'DEPOSIT': return 'heroArrowDownLeft';
      case 'WITHDRAWAL': return 'heroArrowUpRight';
      case 'TRANSFER': return 'heroArrowsRightLeft';
      default: return 'heroClock';
    }
  }

  viewTransactionDetails(tx: Transaction): void {
    this.router.navigate(['/client/dashboard/transactions', tx.id]);
  }

  viewDetails(account: Account): void {
    this.router.navigate(['/client/dashboard/accounts', account.id]);
  }

  goToNewTransfer(): void {
    this.router.navigate(['/client/dashboard/operations']);
  }

  gotoHistory(): void {
    this.router.navigate(['/client/dashboard/history']);
  }
}
