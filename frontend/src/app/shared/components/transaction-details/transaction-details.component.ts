import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  heroXMark, 
  heroArrowsRightLeft, 
  heroArrowDownLeft, 
  heroArrowUpRight,
  heroClock,
  heroCheckCircle,
  heroHashtag,
  heroDocumentText,
  heroCurrencyDollar,
  heroChevronLeft
} from '@ng-icons/heroicons/outline';
import { BankService, Transaction } from '../../../../security/core/services/bank.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export type { Transaction };

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, NgIcon],
  viewProviders: [
    provideIcons({ 
      heroXMark, 
      heroArrowsRightLeft, 
      heroArrowDownLeft, 
      heroArrowUpRight,
      heroClock,
      heroCheckCircle,
      heroHashtag,
      heroDocumentText,
      heroCurrencyDollar,
      heroChevronLeft
    })
  ],
  template: `
    <!-- Overlay for Modal Mode -->
    <div *ngIf="transaction && isModal" class="fixed inset-0 backdrop-blur-sm z-[100] flex items-center justify-center p-4" (click)="onClose()">
      <div class="bg-white rounded-[2.5rem] w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" (click)="$event.stopPropagation()">
        <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
        <!-- Modal Footer -->
        <div class="p-8 pt-0">
          <button (click)="onClose()" class="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition-all">
            Fermer les détails
          </button>
        </div>
      </div>
    </div>

    <!-- Page Mode -->
    <div *ngIf="!isModal" class=" mx-auto space-y-8 pb-12">
        <div class="flex items-center gap-4">
            <button (click)="onClose()" class="p-3 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm group">
                <ng-icon name="heroChevronLeft" size="1.25rem" class="text-slate-600 group-hover:text-blue-600 transition-colors"></ng-icon>
            </button>
            <div>
                <h1 class="text-3xl font-black text-slate-900 tracking-tight">Détails de l'Opération</h1>
                <p class="text-slate-500 font-medium tracking-tight">Consultez les informations détaillées de votre transaction.</p>
            </div>
        </div>

        <div *ngIf="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
            <div class="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p class="text-slate-500 font-medium">Récupération des données...</p>
        </div>

        <div *ngIf="error" class="bg-red-50 border border-red-100 p-8 text-center ">
            <p class="text-red-700 font-bold mb-4">{{ error }}</p>
            <button (click)="onClose()" class="text-red-600 font-black uppercase text-xs tracking-widest hover:underline">Retourner au tableau de bord</button>
        </div>

        <div *ngIf="transaction && !loading" class="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100">
            <ng-container *ngTemplateOutlet="contentTemplate"></ng-container>
            <div class="p-8 pt-0">
                <button (click)="onClose()" class="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-slate-200">
                   Retour
                </button>
            </div>
        </div>
    </div>

    <!-- Shared Content Template -->
    <ng-template #contentTemplate>
      <div *ngIf="transaction">
        <!-- Header Section -->
        <div class="relative h-32 bg-slate-900 p-8 flex items-end">
          <button *ngIf="isModal" (click)="onClose()" class="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <ng-icon name="heroXMark" size="1.25rem"></ng-icon>
          </button>
          <div class="flex items-center gap-4">
              <div class="p-4 rounded-2xl shadow-lg"
                   [ngClass]="{
                     'bg-emerald-500': transaction.transactionType === 'DEPOSIT',
                     'bg-rose-500': transaction.transactionType === 'WITHDRAWAL',
                     'bg-blue-500': transaction.transactionType === 'TRANSFER'
                   }">
                <ng-icon [name]="getIcon()" size="2rem" class="text-white"></ng-icon>
              </div>
              <div class="text-white">
                <h2 class="text-xl font-black">{{ transaction.transactionType }}</h2>
                <p class="text-sm font-medium opacity-70 uppercase tracking-[0.15em]">Transaction #{{ transaction.id }}</p>
              </div>
          </div>
        </div>

        <!-- Details Section -->
        <div class="p-8 space-y-8">
          <!-- Amount -->
          <div class="text-center py-8 bg-slate-50/80 rounded-[2rem] border border-slate-100 shadow-inner">
            <p class="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Montant de la Transaction</p>
            <div class="text-5xl font-black text-slate-900 tracking-tight">
              {{ transaction.amount | number:'1.0-0' }} <span class="text-lg font-bold text-slate-400 ml-1">FCFA</span>
            </div>
            <div class="mt-4 flex items-center justify-center gap-2">
                <span class="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-full flex items-center gap-2 border border-emerald-100">
                    <ng-icon name="heroCheckCircle" size="0.875rem"></ng-icon>
                    Succès
                </span>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="grid grid-cols-2 gap-y-10 gap-x-6">
            <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-slate-400">
                    <ng-icon name="heroClock" size="0.875rem"></ng-icon>
                    <span class="text-[10px] font-black uppercase tracking-wider">Date & Heure</span>
                </div>
                <p class="text-sm font-bold text-slate-800">{{ transaction.transactionDate | date:'dd MMMM yyyy, HH:mm' }}</p>
            </div>

            <div class="space-y-1.5 text-right">
                <div class="flex items-center gap-2 text-slate-400 justify-end">
                    <ng-icon name="heroHashtag" size="0.875rem"></ng-icon>
                    <span class="text-[10px] font-black uppercase tracking-wider">Référence</span>
                </div>
                <p class="text-sm font-bold text-slate-800 font-mono">TXN-{{ transaction.id }}</p>
            </div>

            <div class="col-span-2 space-y-1.5 p-5 bg-slate-50/50 border border-slate-100/50 rounded-2xl">
                <div class="flex items-center gap-2 text-slate-400 mb-1">
                    <ng-icon name="heroDocumentText" size="0.875rem"></ng-icon>
                    <span class="text-[10px] font-black uppercase tracking-wider">Motif / Description</span>
                </div>
                <p class="font-bold text-slate-800 leading-relaxed">{{ transaction.description || 'Aucune description fournie' }}</p>
            </div>

            <div class="space-y-1.5">
                <div class="flex items-center gap-2 text-slate-400">
                    <ng-icon name="heroCreditCard" size="0.875rem"></ng-icon>
                    <span class="text-[10px] font-black uppercase tracking-wider">Compte Source</span>
                </div>
                <p class="text-sm font-bold text-slate-800 font-mono tracking-tight">{{ transaction.sourceAccount?.accountNumber || 'N/A' }}</p>
                <p class="text-[9px] text-slate-400 font-medium">Débité du compte</p>
            </div>

            <div *ngIf="transaction.transactionType === 'TRANSFER'" class="space-y-1.5 text-right">
                <div class="flex items-center gap-2 text-slate-400 justify-end">
                    <ng-icon name="heroArrowsRightLeft" size="0.875rem"></ng-icon>
                    <span class="text-[10px] font-black uppercase tracking-wider">Compte Bénéficiaire</span>
                </div>
                <p class="text-sm font-bold text-slate-800 font-mono tracking-tight">{{ transaction.destinationAccount?.accountNumber || 'N/A' }}</p>
                <p class="text-[9px] text-slate-400 font-medium">Crédité au compte</p>
            </div>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class TransactionDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bankService = inject(BankService);
  private cdr = inject(ChangeDetectorRef);

  @Input() transaction: Transaction | null = null;
  @Input() isModal: boolean = true;
  @Output() close = new EventEmitter<void>();

  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    // If we're not in modal mode and have an ID in route, fetch data
    if (!this.transaction) {
      this.route.params.subscribe(params => {
        const id = params['id'];
        if (id) {
          this.isModal = false;
          this.fetchTransaction(parseInt(id));
        }
      });
    }
  }

  fetchTransaction(id: number): void {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.bankService.getMyTransactionDetails(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
        catchError(err => {
          this.error = "Impossible de récupérer les détails de cette transaction.";
          console.error(err);
          return of(null);
        })
      )
      .subscribe(tx => {
        if (tx) {
          this.transaction = tx;
          this.cdr.detectChanges();
        }
      });
  }

  getIcon(): string {
    if (!this.transaction) return 'heroArrowsRightLeft';
    switch (this.transaction.transactionType) {
      case 'DEPOSIT': return 'heroArrowDownLeft';
      case 'WITHDRAWAL': return 'heroArrowUpRight';
      case 'TRANSFER': return 'heroArrowsRightLeft';
      default: return 'heroArrowsRightLeft';
    }
  }

  onClose(): void {
    if (this.isModal) {
      this.close.emit();
    } else {
      // Go back to previous history or dashboard
      this.router.navigate(['/client/dashboard/acceuil']);
    }
  }
}
