import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankService, Account } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-accounts-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-10 animate-in fade-in duration-700">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-black uppercase tracking-widest">
            Tableau de bord
          </div>
          <h2 class="text-4xl font-black text-slate-900 tracking-tight leading-none">Mes Comptes</h2>
          <p class="text-slate-500 font-medium">Consultez l'état de vos actifs en temps réel.</p>
        </div>
        
        <a routerLink="/dashboard/accounts/new" 
           class="group flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-red-700 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-200">
          <div class="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          Ouvrir un compte
        </a>
      </div>

      <!-- Stats Summary (Quick View) -->
      <div *ngIf="!loading && accounts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div class="absolute -right-10 -top-10 w-40 h-40 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors"></div>
              <p class="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Total des avoirs</p>
              <h3 class="text-3xl font-black">{{ getTotalBalance() | number:'1.0-0' }} <span class="text-slate-500 text-sm">FCFA</span></h3>
              <div class="mt-8 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                  <span>+2.4% ce mois</span>
              </div>
          </div>
          <!-- Other stats could go here -->
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let i of [1,2,3]" class="h-64 rounded-[2rem] bg-slate-100 animate-pulse"></div>
      </div>

      <!-- Accounts Grid -->
      <div *ngIf="!loading && accounts.length > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let acc of accounts" 
             class="group relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white hover:border-red-600/20 hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-2 transition-all duration-500 overflow-hidden">
          
          <!-- Animated Background -->
          <div class="absolute -right-20 -bottom-20 w-40 h-40 bg-slate-50 rounded-full group-hover:bg-red-50 transition-colors duration-500"></div>

          <div class="relative z-10">
            <div class="flex items-center justify-between mb-10">
              <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 group-hover:scale-110 transition-transform duration-500">
                <svg *ngIf="acc.accountType === 'CHECKING'" class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <svg *ngIf="acc.accountType === 'SAVINGS'" class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div [ngClass]="acc.accountType === 'SAVINGS' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'" 
                   class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {{ acc.accountType === 'CHECKING' ? 'Courant' : 'Épargne' }}
              </div>
            </div>

            <div class="space-y-4">
              <p class="text-3xl font-black text-slate-900 tracking-tight">
                {{ acc.balance | number:'1.2-2' }} <span class="text-xs text-slate-400 font-bold tracking-normal align-middle ml-1">FCFA</span>
              </p>
              <div class="space-y-1">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence IBAN</p>
                <p class="font-mono text-xs text-slate-700 font-bold bg-slate-50 inline-block px-2 py-1 rounded group-hover:bg-red-50 transition-colors">
                  {{ acc.accountNumber }}
                </p>
              </div>
            </div>

            <div class="mt-10 flex items-center gap-3">
              <a [routerLink]="['/dashboard/transactions/transfer']" 
                 [queryParams]="{ from: acc.id }" 
                 class="flex-1 py-4 text-center bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all hover:shadow-xl shadow-slate-900/20 active:scale-95">
                Virer
              </a>
              <button class="flex-1 py-4 text-center border-2 border-slate-100 text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95">
                Détails
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && accounts.length === 0" class="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
        <div class="mx-auto w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-10 group relative">
          <div class="absolute inset-0 bg-red-400/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
          <svg class="h-16 w-16 text-slate-300 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h3 class="text-2xl font-black text-slate-900">Commencez l'aventure</h3>
        <p class="text-slate-500 mt-3 mb-12 max-w-sm mx-auto">Votre espace banquaire est vide. Ouvrez votre premier compte pour débloquer toutes les fonctionnalités.</p>
        <a routerLink="/dashboard/accounts/new" class="inline-flex items-center gap-3 bg-red-600 text-white px-10 py-5 rounded-2xl font-black hover:bg-red-700 transition-all hover:scale-105 shadow-2xl shadow-red-200">
          Ouvrir mon premier compte
        </a>
      </div>
    </div>
  `
})
export class AccountsListComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  accounts: Account[] = [];
  loading = true;

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchAccounts(userId);
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  fetchAccounts(userId: number): void {
    this.bankService.getAccountsByClient(userId).subscribe({
      next: (data: Account[]) => {
        console.log('Accounts list response:', data);
        this.accounts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching accounts', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTotalBalance(): number {
    return this.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }
}
