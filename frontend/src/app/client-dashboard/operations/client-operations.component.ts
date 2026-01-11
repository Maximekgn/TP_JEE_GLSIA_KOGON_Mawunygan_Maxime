import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-client-operations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-8" *ngIf="accounts$ | async as accounts">
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <!-- Tabs -->
        <div class="flex border-b border-slate-100">
          <button
            *ngFor="let tab of tabs"
            (click)="activeTab = tab.id"
            class="flex-1 py-6 text-sm font-bold uppercase tracking-wider transition-colors border-b-2"
            [ngClass]="
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-400 border-transparent hover:text-indigo-500'
            "
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="p-8 max-w-2xl mx-auto">
          <!-- VIREMENT (TRANSFER) -->
          <form
            *ngIf="activeTab === 'transfer'"
            [formGroup]="transferForm"
            (ngSubmit)="onTransfer()"
            class="space-y-6"
          >
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-slate-900">Nouveau Virement</h3>
              <p class="text-slate-500 text-sm">
                Transfert immédiat entre vos comptes ou vers un bénéficiaire.
              </p>
            </div>

            <!-- Source -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte à débiter</label>
              <select
                formControlName="sourceAccountId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                (change)="updateBalance($event, accounts)"
              >
                <option value="">Sélectionnez un compte</option>
                <option *ngFor="let acc of accounts" [value]="acc.id">
                  {{ acc.accountNumber }} ({{ acc.balance | number : '1.0-0' }} FCFA)
                </option>
              </select>
              <p
                class="text-xs text-red-500"
                *ngIf="hasError(transferForm, 'sourceAccountId', 'required')"
              >
                Requis
              </p>
            </div>

            <!-- Destination -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700"
                >Compte Bénéficiaire (ID ou Sélection)</label
              >
              <!-- For demo simplicity, user selects from dropdown of *all* accounts or types an ID. 
                     Ideally, should select from 'Same Client Accounts' OR 'External IBAN'.
                     For this requirement: "Virement inter-comptes" often implies own accounts. 
                     Let's allow selecting one of THEIR OWN accounts easily. -->
              <select
                formControlName="destinationAccountId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option value="">Sélectionnez un de vos comptes</option>
                <ng-container *ngFor="let acc of accounts">
                  <!-- exclude source -->
                  <option [value]="acc.id" *ngIf="acc.id != transferForm.value.sourceAccountId">
                    {{ acc.accountNumber }} - {{ acc.accountType }}
                  </option>
                </ng-container>
              </select>
              <p class="text-xs text-slate-400">
                Pour virer vers un tiers, veuillez contacter votre conseiller.
              </p>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Montant</label>
              <input
                type="number"
                formControlName="amount"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                placeholder="0.00"
              />
              <p class="text-xs text-red-500" *ngIf="transferForm.errors?.['insufficientFunds']">
                Solde insuffisant
              </p>
            </div>

            <button
              type="submit"
              [disabled]="transferForm.invalid || isSubmitting"
              class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {{ isSubmitting ? 'Traitement...' : 'Confirmer le Virement' }}
            </button>
          </form>

          <!-- DEPOSIT (SIMULATION) -->
          <form
            *ngIf="activeTab === 'deposit'"
            [formGroup]="depositForm"
            (ngSubmit)="onDeposit()"
            class="space-y-6"
          >
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-slate-900">Simulation de Dépôt</h3>
              <p class="text-fuchsia-500 text-sm font-bold">
                ⚠️ Fonctionnalité de démonstration uniquement
              </p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte à créditer</label>
              <select
                formControlName="accountId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              >
                <option *ngFor="let acc of accounts" [value]="acc.id">
                  {{ acc.accountNumber }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Montant</label>
              <input
                type="number"
                formControlName="amount"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>

            <button
              type="submit"
              [disabled]="depositForm.invalid || isSubmitting"
              class="w-full py-4 bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50"
            >
              Effectuer le Versement
            </button>
          </form>

          <!-- WITHDRAWAL (SIMULATION) -->
          <form
            *ngIf="activeTab === 'withdraw'"
            [formGroup]="withdrawForm"
            (ngSubmit)="onWithdraw()"
            class="space-y-6"
          >
            <div class="space-y-2">
              <h3 class="text-xl font-bold text-slate-900">Simulation de Retrait</h3>
              <p class="text-fuchsia-500 text-sm font-bold">
                ⚠️ Fonctionnalité de démonstration uniquement
              </p>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte à débiter</label>
              <select
                formControlName="accountId"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                (change)="updateBalance($event, accounts)"
              >
                <option *ngFor="let acc of accounts" [value]="acc.id">
                  {{ acc.accountNumber }} ({{ acc.balance }} FCFA)
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Montant</label>
              <input
                type="number"
                formControlName="amount"
                class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
              <p class="text-xs text-red-500" *ngIf="withdrawForm.errors?.['insufficientFunds']">
                Solde insuffisant
              </p>
            </div>

            <button
              type="submit"
              [disabled]="withdrawForm.invalid || isSubmitting"
              class="w-full py-4 bg-slate-800 text-white font-bold rounded-xl disabled:opacity-50"
            >
              Effectuer le Retrait
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class ClientOperationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);

  accounts$: Observable<Account[]> = of([]);
  activeTab = 'transfer';
  isSubmitting = false;
  currentBalance = 0;
  private readonly CLIENT_ID = 1;

  tabs = [
    { id: 'transfer', label: 'Virement' },
    { id: 'deposit', label: 'Versement' },
    { id: 'withdraw', label: 'Retrait' },
  ];

  // Forms
  transferForm = this.fb.group(
    {
      sourceAccountId: ['', Validators.required],
      destinationAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    },
    { validators: this.checkFunds('sourceAccountId') }
  );

  depositForm = this.fb.group({
    accountId: ['', Validators.required],
    amount: ['', [Validators.required, Validators.min(1)]],
  });

  withdrawForm = this.fb.group(
    {
      accountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
    },
    { validators: this.checkFunds('accountId') }
  );

  ngOnInit() {
    this.refreshAccounts();
  }

  refreshAccounts() {
    this.accounts$ = this.bankService.getAccountsByClient(this.CLIENT_ID);
  }

  updateBalance(event: any, accounts: Account[]) {
    const id = event.target.value;
    const acc = accounts.find((a) => a.id == id);
    if (acc) this.currentBalance = acc.balance;
  }

  checkFunds(accountField: string) {
    return (group: FormGroup) => {
      const amount = group.get('amount')?.value;
      if (amount && amount > this.currentBalance) return { insufficientFunds: true };
      return null;
    };
  }

  hasError(form: FormGroup, field: string, error: string) {
    return form.get(field)?.touched && form.get(field)?.hasError(error);
  }

  // ACTIONS
  onTransfer() {
    if (this.transferForm.invalid) return;
    this.isSubmitting = true;
    const val = this.transferForm.value;

    this.bankService
      .transfer({
        sourceAccount: { id: parseInt(val.sourceAccountId!) },
        destinationAccount: { id: parseInt(val.destinationAccountId!) },
        amount: parseFloat(val.amount!),
        description: 'Virement Client Web',
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Virement effectué !');
          this.transferForm.reset();
          this.refreshAccounts();
        },
        error: (e) => this.ns.showError('Echec virement'),
      });
  }

  onDeposit() {
    if (this.depositForm.invalid) return;
    this.isSubmitting = true;
    const val = this.depositForm.value;

    this.bankService
      .deposit({
        sourceAccount: { id: parseInt(val.accountId!) },
        amount: parseFloat(val.amount!),
        description: 'Dépôt Guichet/GAB',
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Dépôt crédité !');
          this.depositForm.reset();
          this.refreshAccounts();
        },
      });
  }

  onWithdraw() {
    if (this.withdrawForm.invalid) return;
    this.isSubmitting = true;
    const val = this.withdrawForm.value;

    this.bankService
      .withdraw({
        sourceAccount: { id: parseInt(val.accountId!) },
        amount: parseFloat(val.amount!),
        description: 'Retrait D.A.B',
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Retrait effectué, prenez vos billets.');
          this.withdrawForm.reset();
          this.refreshAccounts();
        },
        error: (e) => this.ns.showError('Fonds insuffisants'),
      });
  }
}
