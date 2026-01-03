import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BankService, Account } from '../../../core/services/bank.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Effectuer un virement</h2>
        <p class="text-slate-500">Envoyez de l'argent en toute sécurité.</p>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 space-y-6">
        <!-- Source Account -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-600">Compte à débiter</label>
          <select
            [(ngModel)]="transferData.sourceAccountId"
            name="sourceAccount"
            class="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option [ngValue]="null" disabled>Sélectionnez un compte</option>
            <option *ngFor="let acc of myAccounts" [ngValue]="acc.id">
              {{ acc.accountType }} - {{ acc.accountNumber }} ({{ acc.balance | number:'1.2-2' }} FCFA)
            </option>
          </select>
        </div>

        <!-- Destination Account -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-600">Compte destinataire (IBAN)</label>
          <input
            type="text"
            [(ngModel)]="transferData.destinationIBAN"
            name="destinationIBAN"
            placeholder="TG00 0000 0000 0000 0000 0000 00"
            class="w-full rounded-xl border border-slate-200 p-3 font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <!-- Amount -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-600">Montant (FCFA)</label>
          <div class="relative">
            <input
              type="number"
              [(ngModel)]="transferData.amount"
              name="amount"
              min="100"
              class="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
            <span class="absolute right-4 top-3 text-slate-400 font-bold">FCFA</span>
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label class="text-sm font-semibold text-slate-600">Motif (Optionnel)</label>
          <input
            type="text"
            [(ngModel)]="transferData.description"
            name="description"
            placeholder="Ex: Loyer, Cadeau..."
            class="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>

        <div class="pt-6">
          <button
            type="button"
            (click)="submitTransfer()"
            [disabled]="loading"
            class="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-100"
          >
            <span *ngIf="!loading">Confirmer le virement</span>
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement en cours...
            </span>
          </button>
        </div>
      </div>

      <!-- Security Note -->
      <div class="flex gap-4 p-4 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
        <svg class="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p class="text-xs">
          <strong>Sécurité :</strong> Vos virements sont protégés par un cryptage de bout en bout. 
          Vérifiez toujours l'IBAN du destinataire avant de confirmer.
        </p>
      </div>
    </div>
  `
})
export class TransferComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  myAccounts: Account[] = [];
  loading = false;
  transferData = {
    sourceAccountId: null as number | null,
    destinationIBAN: '',
    amount: null as number | null,
    description: ''
  };

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchMyAccounts(userId);
    }

    // Pre-select account from query params if available
    this.route.queryParams.subscribe(params => {
      if (params['from']) {
        this.transferData.sourceAccountId = +params['from'];
        this.cdr.detectChanges();
      }
    });
  }

  fetchMyAccounts(userId: number): void {
    this.bankService.getAccountsByClient(userId).subscribe({
      next: (accounts: Account[]) => {
        this.myAccounts = accounts;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching accounts', err);
      }
    });
  }

  submitTransfer(): void {
    console.log('Action: submitTransfer click');
    
    // Manual Validation
    if (!this.transferData.sourceAccountId) {
      this.notificationService.warning('Veuillez sélectionner un compte source.');
      return;
    }
    if (!this.transferData.destinationIBAN || this.transferData.destinationIBAN.trim().length < 5) {
      this.notificationService.warning('Veuillez saisir un IBAN valide.');
      return;
    }
    if (!this.transferData.amount || this.transferData.amount <= 0) {
      this.notificationService.warning('Veuillez saisir un montant valide.');
      return;
    }

    // Check balance locally
    const sourceAcc = this.myAccounts.find(a => a.id === this.transferData.sourceAccountId);
    if (sourceAcc && sourceAcc.balance < this.transferData.amount) {
      this.notificationService.error('Solde insuffisant.');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    const payload = {
      amount: this.transferData.amount,
      description: this.transferData.description,
      transactionType: 'TRANSFER',
      sourceAccount: { id: this.transferData.sourceAccountId },
      destinationAccount: { accountNumber: this.transferData.destinationIBAN },
      transactionDate: new Date().toISOString()
    };

    console.log('API Call: createTransaction', payload);

    this.bankService.createTransaction(payload).subscribe({
      next: (res: any) => {
        console.log('API Success:', res);
        this.notificationService.success('Virement effectué !');
        this.router.navigate(['/dashboard/transactions']);
      },
      error: (err: any) => {
        console.error('API Error:', err);
        const msg = err.status === 403 ? 'Solde insuffisant.' : 
                    err.status === 404 ? 'Compte destinataire introuvable.' : 
                    'Erreur lors du virement.';
        this.notificationService.error(msg);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
