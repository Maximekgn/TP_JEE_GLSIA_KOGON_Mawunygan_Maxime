import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService, Account } from '../../../core/services/bank.service';
import { NotificationService } from '../../../core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8" *ngIf="accounts$ | async as accounts">
      <div class="space-y-2">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Dépôt sur Compte</h2>
        <p class="text-slate-500">Effectuez un dépôt direct sur n'importe quel compte client.</p>
      </div>

      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div class="p-8">
          <form [formGroup]="depositForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Account Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte Bénéficiaire</label>
              <div class="relative">
                <select
                  formControlName="accountId"
                  class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionnez un compte</option>
                  <option *ngFor="let acc of accounts" [value]="acc.id">
                    {{ acc.accountNumber }} - {{ acc.owner?.firstName }}
                    {{ acc.owner?.lastName }} ({{ acc.balance | number: '1.2-2' }} FCFA)
                  </option>
                </select>
                <div
                  class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-5 h-5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </div>
              </div>
              <p
                *ngIf="
                  depositForm.get('accountId')?.touched &&
                  depositForm.get('accountId')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le compte est requis.
              </p>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Montant du Dépôt (FCFA)</label
              >
              <div class="relative group">
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
                />
                <div
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors"
                >
                  <span class="font-bold">₵</span>
                </div>
              </div>
              <p
                *ngIf="
                  depositForm.get('amount')?.touched &&
                  depositForm.get('amount')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le montant est requis.
              </p>
              <p
                *ngIf="depositForm.get('amount')?.hasError('min')"
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le montant doit être supérieur à 0.
              </p>
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Description / Référence</label
              >
              <input
                type="text"
                formControlName="description"
                placeholder="Ex: Dépôt d'espèces au guichet"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              [disabled]="depositForm.invalid || submitting"
              class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1"
            >
              <span *ngIf="!submitting">Confirmer le Dépôt</span>
              <span *ngIf="submitting">Traitement en cours...</span>
              <svg
                *ngIf="!submitting"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <!-- Quick Info Card -->
      <div class="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start space-x-4">
        <div class="bg-red-100 p-2 rounded-lg shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6 text-red-600"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
            />
          </svg>
        </div>
        <div class="space-y-1">
          <h4 class="text-sm font-bold text-red-900 uppercase tracking-tight">Attention</h4>
          <p class="text-sm text-red-700/80 leading-relaxed">
            Cette opération est irréversible. Le solde du client sera crédité immédiatement après
            confirmation.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AdminDepositComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);

  depositForm: FormGroup;
  accounts$: Observable<Account[]> = of([]);
  submitting = false;

  constructor() {
    this.depositForm = this.fb.group({
      accountId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(1)]],
      description: ['Dépôt administratif', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accounts$ = this.bankService.getAllAccounts().pipe(
      catchError((err) => {
        console.error('Error loading accounts', err);
        return of([]);
      }),
    );
  }

  onSubmit(): void {
    if (this.depositForm.invalid) return;

    this.submitting = true;
    const { accountId, amount, description } = this.depositForm.value;

    const payload = {
      amount,
      description,
      sourceAccount: { id: parseInt(accountId) },
    };

    this.bankService
      .deposit(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.notificationService.show('Dépôt effectué avec succès', 'success');
          this.depositForm.reset({
            accountId: '',
            amount: null,
            description: 'Dépôt administratif',
          });
          this.loadAccounts(); // Refresh balances
        },
        error: (err) => {
          console.error('Error performing deposit', err);
          this.notificationService.show('Erreur lors du dépôt', 'error');
        },
      });
  }
}
