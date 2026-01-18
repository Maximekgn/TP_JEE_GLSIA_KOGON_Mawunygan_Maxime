import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroUsers,
  heroCreditCard,
  heroCurrencyDollar,
  heroArrowTrendingUp,
  heroArrowPath,
  heroBanknotes
} from '@ng-icons/heroicons/outline';
import { BankService, Account, Client, Transaction } from '../../../security/core/services/bank.service';
import { forkJoin, map, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-admin-acceuil',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [
    provideIcons({
      heroUsers,
      heroCreditCard,
      heroCurrencyDollar,
      heroArrowTrendingUp,
      heroArrowPath,
      heroBanknotes
    })
  ],
  template: `
    <div class="space-y-8 pb-12">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Tableau de Bord</h1>
          <p class="text-slate-500 mt-1">Vue d'ensemble de l'activité bancaire</p>
        </div>
        <button (click)="loadData()" class="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm text-slate-600 hover:text-blue-600">
           <ng-icon name="heroArrowPath" [class.animate-spin]="loading" size="1.25rem"></ng-icon>
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Clients -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <ng-icon name="heroUsers" size="1.5rem"></ng-icon>
            </div>
            <span class="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full">+{{ clientsGrowth }}%</span>
          </div>
          <h3 class="text-3xl font-black text-slate-900">{{ totalClients }}</h3>
          <p class="text-sm font-medium text-slate-500 mt-1">Clients Total</p>
        </div>

        <!-- Total Accounts -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div class="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <ng-icon name="heroCreditCard" size="1.5rem"></ng-icon>
            </div>
          </div>
          <h3 class="text-3xl font-black text-slate-900">{{ totalAccounts }}</h3>
          <p class="text-sm font-medium text-slate-500 mt-1">Comptes Actifs</p>
        </div>

        <!-- Total Transactions -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div class="flex items-center justify-between mb-4">
             <div class="p-3 bg-orange-50 text-orange-600 rounded-xl">
              <ng-icon name="heroArrowTrendingUp" size="1.5rem"></ng-icon>
            </div>
          </div>
          <h3 class="text-3xl font-black text-slate-900">{{ totalTransactions }}</h3>
          <p class="text-sm font-medium text-slate-500 mt-1">Transactions</p>
        </div>

        <!-- Total Liquidity (Sum of Balances) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
           <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 blur-2xl opacity-50"></div>
           <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ng-icon name="heroBanknotes" size="1.5rem"></ng-icon>
            </div>
          </div>
          <h3 class="text-2xl font-black text-slate-900 relative z-10">{{ totalLiquidity | number:'1.0-0' }} <span class="text-xs text-slate-400">FCFA</span></h3>
          <p class="text-sm font-medium text-slate-500 mt-1 relative z-10">Liquidités Globales</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 text-black">
        <!-- Account Distribution Chart -->
        <div class="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 class="text-xl font-bold text-slate-900 mb-6">Répartition des Comptes</h3>
          
          <div class="flex items-end justify-center gap-4 h-64 mb-8 border-b border-slate-100 pb-4">
             <!-- Courant Bar -->
             <div class="flex flex-col items-center gap-2 group w-16">
                <div class="relative w-full bg-blue-100 rounded-t-xl overflow-hidden transition-all duration-500 hover:bg-blue-200" [style.height.%]="getPercentage('COURANT')">
                   <div class="absolute bottom-0 w-full bg-blue-600 transition-all duration-1000 ease-out h-full"></div>
                </div>
                <span class="text-xs font-bold text-slate-500">Courant</span>
                <span class="text-xs font-bold text-slate-900">{{ stats.courant }}</span>
             </div>

             <!-- Epargne Bar -->
             <div class="flex flex-col items-center gap-2 group w-16">
                <div class="relative w-full bg-emerald-100 rounded-t-xl overflow-hidden transition-all duration-500 hover:bg-emerald-200" [style.height.%]="getPercentage('EPARGNE')">
                   <div class="absolute bottom-0 w-full bg-emerald-500 transition-all duration-1000 ease-out h-full"></div>
                </div>
                <span class="text-xs font-bold text-slate-500">Epargne</span>
                <span class="text-xs font-bold text-slate-900">{{ stats.epargne }}</span>
             </div>

             <!-- Entreprise Bar -->
             <div class="flex flex-col items-center gap-2 group w-16">
                <div class="relative w-full bg-slate-100 rounded-t-xl overflow-hidden transition-all duration-500 hover:bg-slate-200" [style.height.%]="getPercentage('ENTREPRISE')">
                   <div class="absolute bottom-0 w-full bg-slate-800 transition-all duration-1000 ease-out h-full"></div>
                </div>
                 <span class="text-xs font-bold text-slate-500">Entreprise</span>
                 <span class="text-xs font-bold text-slate-900">{{ stats.entreprise }}</span>
             </div>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-600"></div>
                    <span class="text-slate-600">Comptes Courants</span>
                </div>
                <span class="font-bold text-slate-900">{{ getPercentage('COURANT') | number:'1.0-0' }}%</span>
            </div>
             <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span class="text-slate-600">Comptes Epargne</span>
                </div>
                <span class="font-bold text-slate-900">{{ getPercentage('EPARGNE') | number:'1.0-0' }}%</span>
            </div>
             <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-slate-800"></div>
                    <span class="text-slate-600">Comptes Entreprise</span>
                </div>
                <span class="font-bold text-slate-900">{{ getPercentage('ENTREPRISE') | number:'1.0-0' }}%</span>
            </div>
          </div>
        </div>

        <!-- Recent Transactions List -->
        <div class="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
           <h3 class="text-xl font-bold text-slate-900 mb-6">Dernières Transactions</h3>
           
           <div *ngIf="loading" class="flex justify-center py-12">
               <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
           </div>

           <div *ngIf="!loading && recentTransactions.length === 0" class="text-center py-12 bg-slate-50 rounded-2xl border-dashed border-2 border-slate-200">
               <p class="text-slate-500">Aucune transaction récente</p>
           </div>

           <div class="space-y-4" *ngIf="!loading && recentTransactions.length > 0">
               <div *ngFor="let tx of recentTransactions" class="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                   <div class="flex items-center gap-4">
                       <div class="p-3 rounded-full" 
                            [ngClass]="{
                                'bg-green-100 text-green-600': tx.transactionType === 'DEPOSIT',
                                'bg-red-100 text-red-600': tx.transactionType === 'WITHDRAWAL',
                                'bg-blue-100 text-blue-600': tx.transactionType === 'TRANSFER'
                            }">
                            <ng-icon [name]="getTransactionIcon(tx)" size="1.25rem"></ng-icon>
                       </div>
                       <div>
                           <p class="font-bold text-slate-900 text-sm">{{ tx.description || tx.transactionType }}</p>
                           <p class="text-xs text-slate-400">{{ tx.transactionDate | date:'dd MMM yyyy HH:mm' }}</p>
                       </div>
                   </div>
                   <div class="text-right">
                       <p class="font-black text-sm" 
                          [ngClass]="{
                            'text-green-600': tx.transactionType === 'DEPOSIT',
                            'text-slate-900': tx.transactionType !== 'DEPOSIT'
                          }">
                           {{ tx.transactionType === 'DEPOSIT' ? '+' : '-' }}{{ tx.amount | number }} <span class="text-[10px] text-slate-400">FCFA</span>
                       </p>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class AdminAcceuilComponent implements OnInit {
  private bankService = inject(BankService);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  
  // Stats
  totalClients = 0;
  totalAccounts = 0;
  totalTransactions = 0;
  totalLiquidity = 0;
  clientsGrowth = 12; // Static stub for now

  stats = {
    courant: 0,
    epargne: 0,
    entreprise: 0
  };

  recentTransactions: Transaction[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.cdr.detectChanges();

    const clients$ = this.bankService.getAllClients().pipe(catchError(() => of([])));
    const accounts$ = this.bankService.getAllAccounts().pipe(catchError(() => of([])));
    const transactions$ = this.bankService.getAllTransactions().pipe(catchError(() => of([])));

    forkJoin({
      clients: clients$,
      accounts: accounts$,
      transactions: transactions$
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe(({ clients, accounts, transactions }) => {
      this.totalClients = clients.length;
      this.totalAccounts = accounts.length;
      this.totalTransactions = transactions.length;

      // Calculate Liquidity
      this.totalLiquidity = accounts.reduce((sum: number, acc: Account) => sum + acc.balance, 0);

      // Calculate Stats
      this.stats.courant = accounts.filter((a: Account) => a.accountType === 'COURANT').length;
      this.stats.epargne = accounts.filter((a: Account) => a.accountType === 'EPARGNE').length;
      this.stats.entreprise = accounts.filter((a: Account) => a.accountType === 'ENTREPRISE').length;

      // Recent Transactions (Sort by date desc and take top 5)
      this.recentTransactions = transactions
        .sort((a: Transaction, b: Transaction) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
        .slice(0, 5);
        
      this.cdr.detectChanges();
    });
  }

  getPercentage(type: 'COURANT' | 'EPARGNE' | 'ENTREPRISE'): number {
    if (this.totalAccounts === 0) return 0;
    const count = type === 'COURANT' ? this.stats.courant :
                  type === 'EPARGNE' ? this.stats.epargne :
                  this.stats.entreprise;
    return (count / this.totalAccounts) * 100;
  }

  getTransactionIcon(tx: Transaction): string {
      switch (tx.transactionType) {
          case 'DEPOSIT': return 'heroArrowTrendingUp'; // Up for deposit
          case 'WITHDRAWAL': return 'heroBanknotes'; // Money leaving
          case 'TRANSFER': return 'heroArrowPath'; // Exchange
          default: return 'heroCreditCard';
      }
  }
}
