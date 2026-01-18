import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCreditCard,
  heroCurrencyDollar,
  heroShieldCheck,
  heroArrowPath,
  heroExclamationCircle,
  heroChevronLeft,
  heroInformationCircle,
  heroArrowsRightLeft,
  heroCalendar,
  heroClock
} from '@ng-icons/heroicons/outline';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import type { Transaction } from '../../shared/components/transaction-details/transaction-details.component';

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

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [
    provideIcons({
      heroCreditCard,
      heroCurrencyDollar,
      heroShieldCheck,
      heroArrowPath,
      heroExclamationCircle,
      heroChevronLeft,
      heroInformationCircle,
      heroArrowsRightLeft,
      heroCalendar,
      heroClock,
    })
  ],
  template: `
    <div class="space-y-8 pb-12">
      <!-- Back Button & Title -->
      <div class="flex items-center gap-4">
        <button (click)="goBack()" class="p-3 bg-white hover:bg-slate-50 border border-slate-200  transition-all shadow-sm group">
          <ng-icon name="heroChevronLeft" size="1.25rem" class="text-slate-600 group-hover:text-blue-600 transition-colors"></ng-icon>
        </button>
        <div>
          <h1 class="text-3xl font-black text-slate-900 tracking-tight">Détails du Compte</h1>
          <p class="text-slate-500 font-medium">Consultez les informations et l'historique de votre compte.</p>
        </div>
      </div>

      <div *ngIf="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="relative w-16 h-16">
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="text-slate-500 font-medium">Chargement des données...</p>
      </div>

      <div *ngIf="error" class="bg-red-50 border border-red-100 p-12 text-center max-w-2xl mx-auto ">
        <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <ng-icon name="heroExclamationCircle" size="2rem" class="text-red-600"></ng-icon>
        </div>
        <h3 class="text-xl font-bold text-red-900 mb-2">Une erreur est survenue</h3>
        <p class="text-red-700 mb-8">{{ error }}</p>
        <button (click)="loadData()" class="px-8 py-3 bg-red-600 text-white font-bold  hover:bg-red-700 transition">
          Réessayer
        </button>
      </div>

      <div *ngIf="account && !loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Account Info Card -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden flex flex-col min-h-[320px]">
            <div class="absolute -right-12 -top-12 w-48 h-48 bg-blue-600 rounded-full opacity-[0.03]"></div>
            
            <div class="relative z-10 flex flex-col h-full">
              <div class="flex justify-between items-start mb-10">
                <div class="p-4 bg-blue-50 text-blue-600  shadow-sm">
                  <ng-icon name="heroCreditCard" size="2rem"></ng-icon>
                </div>
                <span class="px-5 py-2 bg-blue-600 text-[10px] text-white font-black uppercase tracking-widest ">
                  {{ account.accountType }}
                </span>
              </div>

              <div class="mt-auto space-y-6">
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Solde Actuel</p>
                  <h3 class="text-4xl font-black text-slate-900 leading-none tracking-tight">
                    {{ account.balance | number:'1.0-0' }} <span class="text-sm font-bold text-slate-400 ml-1">FCFA</span>
                  </h3>
                </div>

                <div class="pt-6 border-t border-slate-50">
                  <p class="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mb-1.5">Numéro de Compte</p>
                  <div class="flex items-center justify-between">
                    <p class="text-lg font-black text-slate-700 font-mono tracking-tight">{{ account.accountNumber }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-slate-900 p-8  shadow-xl shadow-slate-200 relative overflow-hidden group">
            <h4 class="text-white font-black text-lg mb-6 relative z-10">Actions Rapides</h4>
            <div class="grid grid-cols-1 gap-3 relative z-10">
              <button (click)="gotoTransfer()" class="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20  text-white transition-all group/btn border border-white/5">
                <div class="p-2 transition-colors">
                  <ng-icon name="heroArrowsRightLeft" size="1.25rem"></ng-icon>
                </div>
                <div class="text-left font-bold text-sm">Effectuer un virement</div>
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction History -->
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white p-8 shadow-xl shadow-slate-200/50 border border-slate-100 ">
                <div class="flex items-center justify-between mb-10">
                    <div class="flex items-center gap-3">
                        <div class="w-1.5 h-6 bg-blue-600 "></div>
                        <h2 class="text-2xl font-black text-slate-900 tracking-tight">Historique du Compte</h2>
                    </div>
                    <button (click)="loadTransactions()" class="p-2 text-slate-400 hover:text-blue-600 transition-colors" [class.animate-spin]="loadingTransactions">
                        <ng-icon name="heroArrowPath" size="1.25rem"></ng-icon>
                    </button>
                </div>

                <div *ngIf="loadingTransactions && transactions.length === 0" class="py-20 text-center">
                    <div class="relative w-10 h-10 mx-auto mb-4">
                        <div class="absolute top-0 left-0 w-full h-full border-2 border-blue-50 rounded-full"></div>
                        <div class="absolute top-0 left-0 w-full h-full border-2 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p class="text-slate-400 font-medium">Récupération des opérations...</p>
                </div>

                <div *ngIf="!loadingTransactions && transactions.length === 0" class="py-24 text-center bg-slate-50/50  border-2 border-dashed border-slate-100 max-w-md mx-auto">
                    <div class="p-4 bg-white rounded-full w-fit mx-auto mb-6 shadow-sm">
                        <ng-icon name="heroInformationCircle" size="2.5rem" class="text-slate-200"></ng-icon>
                    </div>
                    <p class="text-slate-500 font-medium">Aucune transaction trouvée pour ce compte.</p>
                </div>

                <div *ngIf="transactions.length > 0" class="space-y-4">
                    <div *ngFor="let t of transactions" 
                         (click)="showTransactionDetails(t)"
                         class="flex items-center gap-5 p-6 bg-white border border-slate-50 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50/50 transition-all duration-300 group cursor-pointer relative overflow-hidden">
                        
                        <div class="p-4  transition-all duration-300 shadow-sm"
                             [ngClass]="{
                                'bg-emerald-50 text-emerald-600': t.transactionType === 'DEPOSIT',
                                'bg-rose-50 text-rose-600': t.transactionType === 'WITHDRAWAL',
                                'bg-blue-50 text-blue-600': t.transactionType === 'TRANSFER'
                             }">
                            <ng-icon [name]="getTransactionIcon(t)" size="1.5rem"></ng-icon>
                        </div>

                        <div class="flex-1 min-w-0">
                            <h4 class="font-black text-slate-800 group-hover:text-blue-600 transition-colors truncate">{{ t.description || t.transactionType }}</h4>
                            <div class="flex items-center gap-3 mt-1.5">
                                <span class="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                                    <ng-icon name="heroClock" size="0.75rem"></ng-icon>
                                    {{ t.transactionDate | date:'dd MMM yyyy, HH:mm' }}
                                </span>
                            </div>
                        </div>

                        <div class="text-right">
                            <p class="text-lg font-black tracking-tight"
                               [ngClass]="{
                                 'text-emerald-600': t.transactionType === 'DEPOSIT',
                                 'text-slate-900': t.transactionType !== 'DEPOSIT'
                               }">
                                {{ t.transactionType === 'DEPOSIT' ? '+' : '-' }}{{ t.amount | number:'1.0-0' }} 
                                <span class="text-[10px] font-bold text-slate-400 ml-0.5">FCFA</span>
                            </p>
                            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 mt-1 block">Ref: TXN-{{ t.id }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AccountDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  account: Account | null = null;
  transactions: Transaction[] = [];
  loading = true;
  loadingTransactions = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchAccountDetails(parseInt(id));
      } else {
        // Try query params for compatibility with existing navigation
        this.route.queryParamMap.subscribe(qParams => {
          const qId = qParams.get('accountId');
          if (qId) {
            this.fetchAccountDetails(parseInt(qId));
          } else {
            this.error = "Identifiant de compte manquant";
            this.loading = false;
          }
        });
      }
    });
  }

  fetchAccountDetails(id: number): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.http.get<Account>(`/api/client/accounts/${id}`)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        catchError(err => {
          this.error = err.error?.message || "Impossible de charger les détails du compte";
          return of(null);
        })
      )
      .subscribe(account => {
        if (account) {
          this.account = account;
          this.loadTransactions();
        }
      });
  }

  loadTransactions(): void {
    if (!this.account) return;
    this.loadingTransactions = true;
    this.cdr.detectChanges();

    this.http.get<Transaction[]>(`/api/client/accounts/${this.account.id}/transactions`)
      .pipe(
        finalize(() => {
          this.loadingTransactions = false;
          this.cdr.detectChanges();
        }),
        catchError(err => {
          console.error("Error loading transactions:", err);
          return of([]);
        })
      )
      .subscribe(transactions => {
        this.transactions = transactions;
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

  showTransactionDetails(t: Transaction): void {
    this.router.navigate(['/client/dashboard/transactions', t.id]);
  }

  goBack(): void {
    this.router.navigate(['/client/dashboard/acceuil']);
  }

  gotoTransfer(): void {
    this.router.navigate(['/client/dashboard/operations'], {
      queryParams: { accountId: this.account?.id }
    });
  }
}
