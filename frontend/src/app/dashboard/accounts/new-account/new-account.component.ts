import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankService } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-new-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Ouvrir un nouveau compte</h2>
        <p class="text-slate-500 text-lg">Choisissez la solution qui correspond à vos projets.</p>
      </div>

      <div class="grid gap-8 md:grid-cols-2">
        <!-- Checking Account Card -->
        <div 
          (click)="selectAccount('CHECKING')"
          [ngClass]="{
            'border-red-600 ring-2 ring-red-600/10 shadow-xl shadow-red-900/5 -translate-y-2': accountData.accountType === 'CHECKING',
            'border-slate-100 bg-white hover:border-red-200 hover:shadow-lg': accountData.accountType !== 'CHECKING'
          }"
          class="group relative cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300"
        >
          <div 
            class="absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
            [ngClass]="accountData.accountType === 'CHECKING' ? 'bg-red-600 border-red-600' : 'border-slate-200'"
          >
            <svg *ngIf="accountData.accountType === 'CHECKING'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-6 group-hover:scale-110 transition-transform">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          
          <h3 class="text-xl font-bold text-slate-900">Compte Courant</h3>
          <p class="text-slate-500 mt-3 text-sm leading-relaxed">Liberté totale pour vos transactions quotidiennes et paiements par carte.</p>
          
          <ul class="mt-8 space-y-4">
            <li class="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Carte bancaire Visa incluse
            </li>
            <li class="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Virements illimités gratuits
            </li>
            <li class="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Gestion mobile 24/7
            </li>
          </ul>
        </div>

        <!-- Savings Account Card -->
        <div 
          (click)="selectAccount('SAVINGS')"
          [ngClass]="{
            'border-red-600 ring-2 ring-red-600/10 shadow-xl shadow-red-900/5 -translate-y-2': accountData.accountType === 'SAVINGS',
            'border-slate-100 bg-white hover:border-red-200 hover:shadow-lg': accountData.accountType !== 'SAVINGS'
          }"
          class="group relative cursor-pointer rounded-3xl border-2 p-8 transition-all duration-300"
        >
          <div 
            class="absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
            [ngClass]="accountData.accountType === 'SAVINGS' ? 'bg-red-600 border-red-600' : 'border-slate-200'"
          >
            <svg *ngIf="accountData.accountType === 'SAVINGS'" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-6 group-hover:scale-110 transition-transform">
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 class="text-xl font-bold text-slate-900">Compte Épargne</h3>
          <p class="text-slate-500 mt-3 text-sm leading-relaxed">Mettez de l'argent de côté et générez des intérêts chaque mois.</p>
          
          <ul class="mt-8 space-y-4">
            <li class="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Taux boosté à 3.5% annuel
            </li>
            <li class="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Disponibilité immédiate des fonds
            </li>
            <li class="flex items-center gap-3 text-sm text-slate-600 font-medium">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              Plafond jusqu'à 20.000.000 FCFA
            </li>
          </ul>
        </div>
      </div>

      <div class="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl overflow-hidden relative group">
        <!-- Background decorative elements -->
        <div class="absolute -right-20 -top-20 w-64 h-64 bg-red-600/20 rounded-full blur-3xl group-hover:bg-red-600/30 transition-colors"></div>
        <div class="absolute -left-20 -bottom-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>

        <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div class="space-y-4 max-w-lg">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Offre Activation immédiate
            </div>
            <h4 class="text-2xl font-bold">Prêt à démarrer ?</h4>
            <p class="text-slate-400 text-sm leading-relaxed">
              En cliquant sur le bouton ci-dessous, votre nouveau compte sera généré avec un numéro IBAN unique. 
              Vous pourrez l'utiliser pour recevoir vos premiers dépôts dès maintenant.
            </p>
          </div>

          <button
            (click)="confirmCreation()"
            [disabled]="loading"
            class="whitespace-nowrap px-10 py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-red-50 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-xl"
          >
            <div class="flex items-center gap-3">
               <span *ngIf="!loading">Confirmer l'ouverture</span>
               <svg *ngIf="loading" class="animate-spin h-5 w-5 text-slate-900" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span *ngIf="loading">Création en cours...</span>
               <svg *ngIf="!loading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
               </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NewAccountComponent {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  loading = false;
  accountData = {
    accountType: 'CHECKING' as 'CHECKING' | 'SAVINGS'
  };

  selectAccount(type: 'CHECKING' | 'SAVINGS'): void {
    this.accountData.accountType = type;
    this.cdr.detectChanges();
  }

  confirmCreation(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.loading = true;
    this.cdr.detectChanges();
    
    const payload = {
      accountType: this.accountData.accountType,
      owner: { id: userId },
      balance: 0,
      creationDate: new Date().toISOString().split('T')[0]
    };

    console.log('API Request: createAccount', payload);

    this.bankService.createAccount(payload).subscribe({
      next: (res) => {
        console.log('API Response: account created', res);
        this.notificationService.success('Votre nouveau compte est prêt !');
        this.router.navigate(['/dashboard/accounts']);
      },
      error: (err) => {
        console.error('Account creation error', err);
        this.notificationService.error('Impossible de créer le compte pour le moment.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
