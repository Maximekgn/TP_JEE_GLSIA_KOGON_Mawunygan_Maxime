import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroBanknotes, heroChevronDown, heroPlus, heroInformationCircle } from '@ng-icons/heroicons/outline';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-admin-deposit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  viewProviders: [
    provideIcons({ heroBanknotes, heroChevronDown, heroPlus, heroInformationCircle })
  ],
  template: `
    <div class="max-w-2xl mx-auto space-y-8" *ngIf="accounts$ | async as accounts">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-green-100 rounded-xl">
            <ng-icon name="heroBanknotes" size="1.5rem" class="text-green-600"></ng-icon>
          </div>
          <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Dépôt sur Compte</h2>
        </div>
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
                  class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none"
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
                  depositForm.get('accountId')?.touched &&
                  depositForm.get('accountId')?.hasError('required')
                "
                class="text-xs font-medium text-blue-500 mt-1 pl-1"
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
                  depositForm.get('amount')?.touched &&
                  depositForm.get('amount')?.hasError('required')
                "
                class="text-xs font-medium text-blue-500 mt-1 pl-1"
              >
                Le montant est requis.
              </p>
              <p
                *ngIf="depositForm.get('amount')?.hasError('min')"
                class="text-xs font-medium text-blue-500 mt-1 pl-1"
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
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              [disabled]="depositForm.invalid || submitting"
              class="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1"
            >
              <span *ngIf="!submitting">Confirmer le Dépôt</span>
              <span *ngIf="submitting">Traitement en cours...</span>
              <ng-icon *ngIf="!submitting" name="heroPlus" size="1.25rem"></ng-icon>
            </button>
          </form>
        </div>
      </div>

      <!-- Quick Info Card -->
      <div class="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
        <div class="bg-blue-100 p-2 rounded-lg shrink-0">
          <ng-icon name="heroInformationCircle" size="1.5rem" class="text-blue-600"></ng-icon>
        </div>
        <div class="space-y-1">
          <h4 class="text-sm font-bold text-blue-900 uppercase tracking-tight">Attention</h4>
          <p class="text-sm text-blue-700/80 leading-relaxed">
            Cette opération est irréversible. Le solde du client sera crédité immédiatement après
            confirmation.
          </p>
        </div>
      </div>

      <!-- Logs Panel -->
      <div class="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-sm font-semibold">Logs Requête / Réponse</h4>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              (click)="logs = []"
              class="text-xs text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
            <span class="text-xs text-slate-400">({{ logs.length }})</span>
          </div>
        </div>

        <div *ngIf="logs.length === 0" class="text-xs text-slate-400">Aucun log</div>

        <ul
          *ngIf="logs.length > 0"
          class="text-xs font-mono max-h-40 overflow-auto space-y-2"
          aria-live="polite"
        >
          <li *ngFor="let l of logs">{{ l }}</li>
        </ul>
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
  logs: string[] = [];

  private appendLog(message: string) {
    try {
      const ts = new Date().toISOString();
      this.logs.unshift(`${ts} - ${message}`);
      if (this.logs.length > 200) {
        this.logs.length = 200;
      }
    } catch (e) {
      // ignore logging failures in UI
    }
  }

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

    try {
      this.appendLog(
        `REQUEST -> POST /api/transactions/deposit payload=${JSON.stringify(payload)}`,
      );
    } catch (e) {
      this.appendLog(`REQUEST -> POST /api/transactions/deposit payload=[unserializable]`);
    }

    this.bankService
      .deposit(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: (res: any) => {
          this.notificationService.showSuccess('Dépôt effectué avec succès');
          this.depositForm.reset({
            accountId: '',
            amount: null,
            description: 'Dépôt administratif',
          });
          this.loadAccounts();

          try {
            const status = res?.status;
            this.appendLog(`RESPONSE ${status} -> Succès`);
          } catch (e) {
            this.appendLog('RESPONSE -> Succès');
          }
        },
        error: (err: any) => {
          try {
            const errMsg =
              err?.message || (err && err.status ? `status=${err.status}` : JSON.stringify(err));
            this.appendLog(`ERROR -> ${errMsg}`);
          } catch (e) {
            this.appendLog('ERROR -> [error]');
          }

          console.error('Error performing deposit', err);
          this.notificationService.showError('Échec du dépôt');
        },
      });
  }
}
