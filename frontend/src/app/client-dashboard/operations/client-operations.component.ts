import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowsRightLeft } from '@ng-icons/heroicons/outline';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-client-operations',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  viewProviders: [
    provideIcons({ heroArrowsRightLeft })
  ],
  template: `
    <div class="space-y-8" *ngIf="!loadingAccounts; else loadingTemplate">
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <!-- Header -->
        <div class="p-8 border-b border-slate-100 bg-slate-50/30">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-blue-100 rounded-xl">
              <ng-icon name="heroArrowsRightLeft" size="1.25rem" class="text-blue-600"></ng-icon>
            </div>
            <h3 class="text-2xl font-bold text-slate-900">Virement Bancaire</h3>
          </div>
          <p class="text-slate-500 mt-1">
            Transférez des fonds en toute sécurité entre vos comptes ou vers un autre bénéficiaire.
          </p>
        </div>

        <div class="p-8 max-w-2xl mx-auto">
          <!-- VIREMENT (TRANSFER) -->
          <form [formGroup]="transferForm" (ngSubmit)="onTransfer()" class="space-y-6">
            <!-- Type de Virement -->
            <div class="space-y-3">
              <label class="block text-sm font-semibold text-slate-700">Type de bénéficiaire</label>
              <div class="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  (click)="setDestinationType('own')"
                  [class]="
                    destinationType === 'own'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  "
                  class="py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all"
                >
                  Mes Comptes
                </button>
                <button
                  type="button"
                  (click)="setDestinationType('external')"
                  [class]="
                    destinationType === 'external'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                  "
                  class="py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all"
                >
                  Autre Bénéficiaire
                </button>
              </div>
            </div>

            <!-- Source -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Compte à débiter</label>
              <select
                formControlName="sourceAccountId"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
                (change)="updateBalance($event)"
              >
                <option value="">Sélectionnez un compte</option>
                <option *ngFor="let acc of accounts" [value]="acc.id">
                  {{ acc.accountNumber }} ({{ acc.balance | number: '1.0-0' }} FCFA)
                </option>
              </select>
              <p
                class="text-xs text-red-500 mt-1"
                *ngIf="hasError(transferForm, 'sourceAccountId', 'required')"
              >
                Veuillez sélectionner le compte source
              </p>
            </div>

            <!-- Destination OWN -->
            <div class="space-y-2" *ngIf="destinationType === 'own'">
              <label class="block text-sm font-semibold text-slate-700">Compte bénéficiaire</label>
              <select
                formControlName="destinationAccountId"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              >
                <option value="">Sélectionnez un de vos comptes</option>
                <ng-container *ngFor="let acc of accounts">
                  <option [value]="acc.id" *ngIf="acc.id != transferForm.value.sourceAccountId">
                    {{ acc.accountNumber }} - {{ acc.accountType }}
                  </option>
                </ng-container>
              </select>
              <p
                class="text-xs text-red-500 mt-1"
                *ngIf="hasError(transferForm, 'destinationAccountId', 'required')"
              >
                Veuillez sélectionner le compte de destination
              </p>
            </div>

            <!-- Destination EXTERNAL -->
            <div class="space-y-2" *ngIf="destinationType === 'external'">
              <label class="block text-sm font-semibold text-slate-700">Numéro de compte bénéficiaire</label>
              <input
                type="text"
                formControlName="destinationAccountNumber"
                placeholder="Ex: ACC-123456"
                class="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"
              />
              <p
                class="text-xs text-red-500 mt-1"
                *ngIf="hasError(transferForm, 'destinationAccountNumber', 'required')"
              >
                Le numéro de compte est requis
              </p>
            </div>

            <!-- Amount -->
            <div class="space-y-2">
              <label class="block text-sm font-semibold text-slate-700">Montant à transférer</label>
              <div class="relative">
                <input
                  type="number"
                  formControlName="amount"
                  class="w-full pl-4 pr-16 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-bold text-lg"
                  placeholder="0"
                />
                <span class="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">FCFA</span>
              </div>
              <p class="text-xs text-red-500 mt-1" *ngIf="transferForm.errors?.['insufficientFunds']">
                Solde insuffisant (Solde actuel: {{ currentBalance | number: '1.0-0' }} FCFA)
              </p>
              <p class="text-xs text-red-500 mt-1" *ngIf="hasError(transferForm, 'amount', 'min')">
                Le montant doit être supérieur à 0
              </p>
            </div>

            <button
              type="submit"
              [disabled]="transferForm.invalid || isSubmitting"
              class="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <div *ngIf="isSubmitting" class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              {{ isSubmitting ? 'Traitement en cours...' : 'Confirmer le Virement' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="flex flex-col items-center justify-center py-24 space-y-4">
        <div class="relative w-16 h-16">
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
          <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p class="text-slate-500 font-medium animate-pulse">Chargement de vos comptes...</p>
      </div>
    </ng-template>
  `,
  styles: [],
})
export class ClientOperationsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  accounts: Account[] = [];
  loadingAccounts = false;
  isSubmitting = false;
  currentBalance = 0;
  destinationType: 'own' | 'external' = 'own';

  private authService = inject(ClientAuthService);
  private readonly CLIENT_ID = this.authService.getUserId() || 1;

  // Forms
  transferForm = this.fb.group(
    {
      sourceAccountId: ['', Validators.required],
      destinationAccountId: [''],
      destinationAccountNumber: [''],
      amount: ['', [Validators.required, Validators.min(1)]],
    },
    { validators: [this.checkFunds('sourceAccountId'), this.validateDestination()] },
  );

  ngOnInit() {
    this.refreshAccounts();
    this.route.queryParams.subscribe((params) => {
      const accountId = params['accountId'];
      if (accountId) {
        this.transferForm.patchValue({ sourceAccountId: accountId });
        
        if (this.accounts.length > 0) {
          const acc = this.accounts.find((a: Account) => a.id == accountId);
          if (acc) this.currentBalance = acc.balance;
          this.cdr.detectChanges();
        }
      }
    });
  }

  refreshAccounts() {
    this.loadingAccounts = true;
    this.cdr.detectChanges();
    this.bankService.getAccountsByClient(this.CLIENT_ID)
      .pipe(
        finalize(() => {
          this.loadingAccounts = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.accounts = data;
          
          const sourceId = this.transferForm.get('sourceAccountId')?.value;
          if (sourceId) {
            const acc = this.accounts.find((a: Account) => a.id == sourceId);
            if (acc) this.currentBalance = acc.balance;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading accounts:', err);
          this.ns.showError('Impossible de charger vos comptes');
        }
      });
  }

  setDestinationType(type: 'own' | 'external') {
    this.destinationType = type;
    if (type === 'own') {
      this.transferForm.patchValue({ destinationAccountNumber: '' });
      this.transferForm.get('destinationAccountId')?.setValidators(Validators.required);
      this.transferForm.get('destinationAccountNumber')?.clearValidators();
    } else {
      this.transferForm.patchValue({ destinationAccountId: '' });
      this.transferForm.get('destinationAccountNumber')?.setValidators(Validators.required);
      this.transferForm.get('destinationAccountId')?.clearValidators();
    }
    this.transferForm.get('destinationAccountId')?.updateValueAndValidity();
    this.transferForm.get('destinationAccountNumber')?.updateValueAndValidity();
  }

  updateBalance(event: any) {
    const id = event.target.value;
    const acc = this.accounts.find((a) => a.id == id);
    this.currentBalance = acc ? acc.balance : 0;
    this.transferForm.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  validateDestination() {
    return (group: FormGroup) => {
      const destId = group.get('destinationAccountId')?.value;
      const destNum = group.get('destinationAccountNumber')?.value;

      if (this.destinationType === 'own' && !destId) return { destinationRequired: true };
      if (this.destinationType === 'external' && !destNum) return { destinationRequired: true };
      return null;
    };
  }

  checkFunds(accountField: string) {
    return (group: FormGroup) => {
      const amount = group.get('amount')?.value;
      if (amount && amount > this.currentBalance) return { insufficientFunds: true };
      return null;
    };
  }

  hasError(form: FormGroup, field: string, error: string) {
    const control = form.get(field);
    return control?.touched && control?.hasError(error);
  }

  onTransfer() {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const val = this.transferForm.value;

    const payload: any = {
      sourceAccount: { id: parseInt(val.sourceAccountId!) },
      amount: parseFloat(val.amount!),
      description: 'Virement Client Web',
    };

    if (this.destinationType === 'own') {
      payload.destinationAccount = { id: parseInt(val.destinationAccountId!) };
    } else {
      payload.destinationAccount = { accountNumber: val.destinationAccountNumber };
    }

    this.bankService
      .transfer(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Virement effectué avec succès !');
          this.transferForm.reset();
          this.refreshAccounts();
          this.destinationType = 'own';
        },
        error: (e) => {
          console.error(e);
          const message = e.status === 404 ? 'Compte destinataire inexistant' : 'Echec du virement';
          this.ns.showError(message);
        },
      });
  }
}
