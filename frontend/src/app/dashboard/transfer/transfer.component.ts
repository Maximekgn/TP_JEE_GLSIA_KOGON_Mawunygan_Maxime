import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-transfer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8" *ngIf="accounts$ | async as accounts">
      <div class="space-y-2">
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Virement Bancaire</h2>
        <p class="text-slate-500">Transférez des fonds entre deux comptes clients.</p>
      </div>

      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div class="p-8">
          <form [formGroup]="transferForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Source Account -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Compte Débiteur (Source)</label
              >
              <div class="relative">
                <select
                  formControlName="sourceAccountId"
                  class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                  (change)="onSourceChange($event, accounts)"
                >
                  <option value="">Sélectionnez un compte source</option>
                  <option *ngFor="let acc of accounts" [value]="acc.id">
                    {{ acc.accountNumber }} - {{ acc.owner?.firstName }}
                    {{ acc.owner?.lastName }} ({{ acc.balance | number : '1.2-2' }} FCFA)
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
                  transferForm.get('sourceAccountId')?.touched &&
                  transferForm.get('sourceAccountId')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le compte source est requis.
              </p>
            </div>

            <!-- Destination Account (Dropdown or Input? Dropdown for admin is easier but user might want Input) -->
            <!-- Let's provide Dropdown as 'Select from list' and an optional text input if list is huge? 
                 Simple admin panel: Dropdown is safer to avoid typos. -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Compte Créditeur (Destination)</label
              >
              <div class="relative">
                <select
                  formControlName="destinationAccountId"
                  class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                >
                  <option value="">Sélectionnez un compte destination</option>
                  <ng-container *ngFor="let acc of accounts">
                    <option [value]="acc.id" *ngIf="acc.id != transferForm.value.sourceAccountId">
                      {{ acc.accountNumber }} - {{ acc.owner?.firstName }} {{ acc.owner?.lastName }}
                    </option>
                  </ng-container>
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
                  transferForm.get('destinationAccountId')?.touched &&
                  transferForm.get('destinationAccountId')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le compte destination est requis.
              </p>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Montant du Virement (FCFA)</label
              >
              <div class="relative group">
                <input
                  type="number"
                  formControlName="amount"
                  placeholder="0.00"
                  class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
                <div
                  class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
                >
                  <span class="font-bold">₵</span>
                </div>
              </div>
              <p
                *ngIf="
                  transferForm.get('amount')?.touched &&
                  transferForm.get('amount')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le montant est requis.
              </p>
              <p
                *ngIf="transferForm.errors?.['insufficientFunds']"
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Solde insuffisant sur le compte source.
              </p>
            </div>

            <button
              type="submit"
              [disabled]="transferForm.invalid || isSubmitting"
              class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span *ngIf="!isSubmitting">Effectuer le Virement</span>
              <span *ngIf="isSubmitting">Traitement...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class TransferComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);

  accounts$: Observable<Account[]> = of([]);
  isSubmitting = false;
  sourceBalance = 0;

  transferForm: FormGroup = this.fb.group(
    {
      sourceAccountId: ['', Validators.required],
      destinationAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    },
    { validators: this.insufficientFundsValidator.bind(this) }
  );

  ngOnInit(): void {
    this.accounts$ = this.bankService.getAllAccounts().pipe(
      catchError((err) => {
        this.notificationService.showError('Impossible de charger les comptes');
        return of([]);
      })
    );
  }

  onSourceChange(event: any, accounts: Account[]) {
    const accountId = event.target.value;
    const account = accounts.find((a) => a.id == accountId);
    if (account) {
      this.sourceBalance = account.balance;
      this.transferForm.updateValueAndValidity();

      // If destination is same as source, reset destination
      if (this.transferForm.get('destinationAccountId')?.value == accountId) {
        this.transferForm.patchValue({ destinationAccountId: '' });
      }
    }
  }

  insufficientFundsValidator(group: FormGroup) {
    const amount = group.get('amount')?.value;
    if (amount && amount > this.sourceBalance) {
      return { insufficientFunds: true };
    }
    return null;
  }

  onSubmit() {
    if (this.transferForm.invalid) return;

    this.isSubmitting = true;
    const { sourceAccountId, destinationAccountId, amount } = this.transferForm.value;

    this.bankService
      .transfer({
        sourceAccount: { id: parseInt(sourceAccountId) },
        destinationAccount: { id: parseInt(destinationAccountId) }, // Using ID for simplicity as we have dropdown
        amount: parseFloat(amount),
        description: 'Virement Admin',
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (tx) => {
          this.notificationService.showSuccess(`Virement de ${amount} FCFA effectué avec succès.`);
          this.transferForm.reset();
          this.ngOnInit(); // Refresh to update balances
        },
        error: (err) => {
          this.notificationService.showError('Echec du virement. ' + (err.error?.message || ''));
        },
      });
  }
}
