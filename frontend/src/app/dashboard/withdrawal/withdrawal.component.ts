import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowDownTray, heroChevronDown } from '@ng-icons/heroicons/outline';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-withdrawal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  viewProviders: [
    provideIcons({ heroArrowDownTray, heroChevronDown })
  ],
  template: `
    <div class="max-w-2xl mx-auto space-y-8" *ngIf="accounts$ | async as accounts">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-orange-100 rounded-xl">
            <ng-icon name="heroArrowDownTray" size="1.5rem" class="text-orange-600"></ng-icon>
          </div>
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Retrait sur Compte</h2>
        </div>
        <p class="text-slate-500">Effectuez un retrait depuis un compte client.</p>
      </div>

      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div class="p-8">
          <form [formGroup]="withdrawalForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Account Selection -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte Source</label>
              <div class="relative">
                <select
                  formControlName="accountId"
                  class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
                  (change)="onAccountChange($event, accounts)"
                >
                  <option value="">Sélectionnez un compte</option>
                  <option *ngFor="let acc of accounts" [value]="acc.id">
                    {{ acc.accountNumber }} - {{ acc.owner?.first_name }}
                    {{ acc.owner?.last_name }} ({{ acc.balance | number: '1.2-2' }} FCFA)
                  </option>
                </select>
                <div
                  class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                >
                  <ng-icon name="heroChevronDown" size="1.25rem"></ng-icon>
                </div>
              </div>
              <p
                *ngIf="
                  withdrawalForm.get('accountId')?.touched &&
                  withdrawalForm.get('accountId')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le compte est requis.
              </p>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Montant du Retrait (FCFA)</label
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
                  withdrawalForm.get('amount')?.touched &&
                  withdrawalForm.get('amount')?.hasError('required')
                "
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le montant est requis.
              </p>
              <p
                *ngIf="withdrawalForm.get('amount')?.hasError('min')"
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Le montant doit être supérieur à 0.
              </p>
              <p
                *ngIf="withdrawalForm.errors?.['insufficientFunds']"
                class="text-xs font-medium text-red-500 mt-1 pl-1"
              >
                Solde insuffisant pour ce retrait.
              </p>
            </div>

            <button
              type="submit"
              [disabled]="withdrawalForm.invalid || isSubmitting"
              class="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              <span *ngIf="!isSubmitting">Effectuer le Retrait</span>
              <span *ngIf="isSubmitting">Traitement...</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class WithdrawalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private notificationService = inject(NotificationService);

  accounts$: Observable<Account[]> = of([]);
  isSubmitting = false;
  selectedAccountBalance = 0;

  withdrawalForm: FormGroup = this.fb.group(
    {
      accountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    },
    { validators: this.insufficientFundsValidator.bind(this) },
  );

  ngOnInit(): void {
    this.accounts$ = this.bankService.getAllAccounts().pipe(
      catchError((err) => {
        this.notificationService.showError('Impossible de charger les comptes');
        return of([]);
      }),
    );
  }

  onAccountChange(event: any, accounts: Account[]) {
    const accountId = event.target.value;
    const account = accounts.find((a) => a.id == accountId);
    if (account) {
      this.selectedAccountBalance = account.balance;
      this.withdrawalForm.updateValueAndValidity();
    }
  }

  insufficientFundsValidator(group: FormGroup) {
    const amount = group.get('amount')?.value;
    if (amount && amount > this.selectedAccountBalance) {
      return { insufficientFunds: true };
    }
    return null;
  }

  onSubmit() {
    if (this.withdrawalForm.invalid) return;

    this.isSubmitting = true;
    const { accountId, amount } = this.withdrawalForm.value;

    this.bankService
      .withdraw({
        sourceAccount: { id: parseInt(accountId) },
        amount: parseFloat(amount),
        description: 'Retrait Guichet',
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (tx) => {
          this.notificationService.showSuccess(`Retrait de ${amount} FCFA effectué avec succès.`);
          this.withdrawalForm.reset();
          this.ngOnInit();
        },
        error: (err) => {
          this.notificationService.showError('Echec du retrait. ' + (err.error?.message || ''));
        },
      });
  }
}
