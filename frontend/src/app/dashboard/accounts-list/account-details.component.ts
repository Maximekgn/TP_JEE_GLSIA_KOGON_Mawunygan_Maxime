import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BankService, Account, Transaction } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { catchError, finalize, of, timeout } from 'rxjs';

@Component({
  selector: 'app-account-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div
      *ngIf="loading() && !error()"
      class="flex flex-col items-center justify-center py-32 space-y-4"
    >
      <div
        class="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"
      ></div>
      <p class="text-slate-500 font-medium animate-pulse">Chargement des détails du compte...</p>
    </div>

    <div
      *ngIf="error()"
      class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-2xl mx-auto my-12 text-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-12 h-12 mx-auto mb-4"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
      <h3 class="text-lg font-bold mb-2">Une erreur est survenue</h3>
      <p class="mb-6">{{ error() }}</p>
      <button
        (click)="ngOnInit()"
        class="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
      >
        Réessayer
      </button>
    </div>

    <div class="space-y-6" *ngIf="account && !loading() && !error()">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav class="flex mb-2" aria-label="Breadcrumb">
            <ol
              class="inline-flex items-center space-x-1 md:space-x-3 text-xs text-slate-500 font-medium"
            >
              <li>
                <a
                  [routerLink]="['/dashboard/admin/clients', account.owner?.id]"
                  class="hover:text-blue-600"
                >
                  Client : {{ account.owner?.first_name }} {{ account.owner?.last_name }}
                </a>
              </li>
              <li><span class="mx-2">/</span></li>
              <li class="text-slate-800">Détails du compte</li>
            </ol>
          </nav>
          <h2 class="text-2xl font-bold text-slate-800">Compte {{ account.accountNumber }}</h2>
          <p class="text-slate-500 text-sm">
            Propriétaire: {{ account.owner?.first_name }} {{ account.owner?.last_name }}
          </p>
        </div>
        <div
          class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4"
        >
          <div class="p-3 bg-blue-50 rounded-lg text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">
              Solde Actuel
            </div>
            <div class="text-2xl font-black text-slate-900">
              {{ account.balance | number: '1.2-2' }} FCFA
            </div>
          </div>
        </div>

        <button
          (click)="deleteAccount()"
          class="flex items-center gap-2 px-6 py-3 bg-white border border-rose-200 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all shadow-sm group"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5 group-hover:scale-110 transition-transform"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m14.74 9-.34 12.142m-4.204 3.69.255-1.166m.512-2.333M7.5 7h9m-9 0a2 2 0 0 0-2 2v1h11V9a2 2 0 0 0-2-2m-9 0h9m-11 5h13m-13 4h13m-13 4h13"
            />
          </svg>
          Supprimer le compte
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Operations Section -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div class="grid grid-cols-3 space-x-1">
                <button
                  (click)="activeTab = 'deposit'"
                  [class]="
                    activeTab === 'deposit'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  "
                  class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Dépôt
                </button>
                <button
                  (click)="activeTab = 'withdraw'"
                  [class]="
                    activeTab === 'withdraw'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  "
                  class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Retrait
                </button>
                <button
                  (click)="activeTab = 'transfer'"
                  [class]="
                    activeTab === 'transfer'
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-200 text-slate-600'
                  "
                  class="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                  Virement
                </button>
              </div>
            </div>

            <div class="p-6">
              <!-- Deposit Form -->
              <form
                *ngIf="activeTab === 'deposit'"
                [formGroup]="depositForm"
                (ngSubmit)="onDeposit()"
                class="space-y-4"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-sm font-bold text-slate-700">Montant du dépôt</label>
                    <input
                      type="number"
                      formControlName="amount"
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-bold text-slate-700">Description</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Motif du dépôt"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  [disabled]="depositForm.invalid || submitting"
                  class="w-full md:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ submitting ? 'Traitement...' : 'Confirmer le dépôt' }}
                </button>
              </form>

              <!-- Withdraw Form -->
              <form
                *ngIf="activeTab === 'withdraw'"
                [formGroup]="withdrawForm"
                (ngSubmit)="onWithdraw()"
                class="space-y-4"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-sm font-bold text-slate-700">Montant du retrait</label>
                    <input
                      type="number"
                      formControlName="amount"
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                    <p
                      *ngIf="withdrawForm.get('amount')?.value > account.balance"
                      class="text-xs text-red-500 font-medium"
                    >
                      Attention: Solde insuffisant
                    </p>
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-bold text-slate-700">Description</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Motif du retrait"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  [disabled]="
                    withdrawForm.invalid ||
                    submitting ||
                    withdrawForm.get('amount')?.value > account.balance
                  "
                  class="w-full md:w-auto px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ submitting ? 'Traitement...' : 'Confirmer le retrait' }}
                </button>
              </form>

              <!-- Transfer Form -->
              <form
                *ngIf="activeTab === 'transfer'"
                [formGroup]="transferForm"
                (ngSubmit)="onTransfer()"
                class="space-y-4"
              >
                <div class="space-y-1">
                  <label class="text-sm font-bold text-slate-700">Compte destinataire</label>
                  <select
                    formControlName="destinationAccountId"
                    class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Sélectionnez un compte</option>
                    <option *ngFor="let acc of otherAccounts" [value]="acc.id">
                      {{ acc.accountNumber }} - {{ acc.owner?.first_name }}
                      {{ acc.owner?.last_name }}
                    </option>
                  </select>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-1">
                    <label class="text-sm font-bold text-slate-700">Montant du virement</label>
                    <input
                      type="number"
                      formControlName="amount"
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="space-y-1">
                    <label class="text-sm font-bold text-slate-700">Description</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Motif du virement"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  [disabled]="
                    transferForm.invalid ||
                    submitting ||
                    transferForm.get('amount')?.value > account.balance
                  "
                  class="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {{ submitting ? 'Traitement...' : 'Confirmer le virement' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Transaction History for Admin -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 class="font-bold text-slate-900 text-lg">Dernières Transactions</h3>
              <button (click)="loadAccountTransactions()" class="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              </button>
            </div>
            <div class="p-0">
              <div *ngIf="loadingTransactions" class="p-12 text-center">
                <div class="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              </div>
              <div *ngIf="!loadingTransactions && transactions.length === 0" class="p-12 text-center text-slate-400">
                <p>Aucune transaction pour ce compte.</p>
              </div>
              <div class="overflow-x-auto" *ngIf="!loadingTransactions && transactions.length > 0">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <th class="px-6 py-3">Date</th>
                      <th class="px-6 py-3">Type</th>
                      <th class="px-6 py-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-50">
                    <tr *ngFor="let tx of transactions" class="hover:bg-slate-50/50 transition-colors">
                      <td class="px-6 py-4">
                        <div class="text-sm font-medium text-slate-900">{{ tx.transactionDate | date:'dd/MM/yyyy' }}</div>
                        <div class="text-[10px] text-slate-400">{{ tx.transactionDate | date:'HH:mm' }}</div>
                      </td>
                      <td class="px-6 py-4">
                         <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                               [ngClass]="{
                                 'bg-green-100 text-green-700': tx.transactionType === 'DEPOSIT',
                                 'bg-rose-100 text-rose-700': tx.transactionType === 'WITHDRAWAL',
                                 'bg-blue-100 text-blue-700': tx.transactionType === 'TRANSFER'
                               }">
                           {{ tx.transactionType }}
                         </span>
                      </td>
                      <td class="px-6 py-4 text-right">
                        <div class="text-sm font-bold" [class.text-green-600]="tx.transactionType === 'DEPOSIT'">
                          {{ tx.transactionType === 'DEPOSIT' ? '+' : '-' }}{{ tx.amount | number }}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Info Sidebar -->
        <div class="space-y-6">
          <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 class="font-bold text-slate-800 border-b pb-2">Informations du compte</h3>
            <div class="space-y-3">
              <div>
                <label class="text-xs font-bold text-slate-400 uppercase">Type de compte</label>
                <div class="font-medium text-slate-800">{{ account.accountType }}</div>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-400 uppercase">Date de création</label>
                <div class="font-medium text-slate-800">
                  {{ account.creationDate | date: 'mediumDate' }}
                </div>
              </div>
              <div>
                <label class="text-xs font-bold text-slate-400 uppercase">Statut</label>
                <div>
                  <span
                    class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full"
                    >Actif</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="bg-slate-800 p-6 rounded-2xl text-white space-y-4">
            <h3 class="font-bold border-b border-slate-700 pb-2">Propriétaire</h3>
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-bold text-xl"
              >
                {{ account.owner?.first_name?.charAt(0) }}{{ account.owner?.last_name?.charAt(0) }}
              </div>
              <div>
                <div class="font-bold">
                  {{ account.owner?.first_name }} {{ account.owner?.last_name }}
                </div>
                <div class="text-slate-400 text-xs">{{ account.owner?.email }}</div>
              </div>
            </div>
            <a
              [routerLink]="['/dashboard/admin/clients', account.owner?.id]"
              class="block text-center py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
            >
              Voir le profil complet
            </a>
          </div>
        </div>
      </div>
    </div>

    <div
      *ngIf="!loading() && !error() && !account"
      class="flex flex-col items-center justify-center py-32 space-y-4"
    >
      <div
        class="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-8 h-8"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </div>
      <h3 class="text-xl font-bold text-slate-900">Compte non trouvé</h3>
      <p class="text-slate-500">Désolé, nous n'avons pas pu trouver les détails de ce compte.</p>
      <a
        routerLink="/dashboard/admin/clients"
        class="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
      >
        Retour aux clients
      </a>
    </div>
  `,
  styles: [],
})
export class AccountDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);

  account: Account | null = null;
  transactions: Transaction[] = [];
  otherAccounts: Account[] = [];
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  activeTab = 'deposit';
  submitting = false;
  loadingTransactions = false;

  depositForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]],
    description: ['Dépôt au guichet', Validators.required],
  });

  withdrawForm: FormGroup = this.fb.group({
    amount: [null, [Validators.required, Validators.min(1)]],
    description: ['Retrait au guichet', Validators.required],
  });

  transferForm: FormGroup = this.fb.group({
    destinationAccountId: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(1)]],
    description: ['Virement bancaire', Validators.required],
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadAccountDetails(id);
        this.loadAccountTransactions(id);
      }
    });
  }

  loadAccountTransactions(id?: number) {
    const accountId = id || this.account?.id;
    if (!accountId) return;

    this.loadingTransactions = true;
    this.bankService.getTransactionsByAccount(accountId).pipe(
      finalize(() => this.loadingTransactions = false)
    ).subscribe({
      next: (data) => {
        this.transactions = data.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
      },
      error: (err) => {
        console.error('Error loading account transactions', err);
      }
    });
  }

  loadAccountDetails(id: number) {
    if (isNaN(id)) {
      this.loading.set(false);
      this.error.set('Identifiant de compte invalide.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.account = null;

    this.bankService
      .getAccountById(id)
      .pipe(
        timeout(5000),
        catchError((err) => {
          console.error('Error loading account', err);
          if (err.name === 'TimeoutError') {
            this.error.set('Le serveur met trop de temps à répondre (Timeout).');
          } else {
            this.error.set(
              'Erreur lors du chargement du compte. Le serveur a répondu : ' +
                (err.error?.message || err.message || 'Erreur inconnue'),
            );
          }
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((data) => {
        if (data) {
          this.account = data;
          this.loadOtherAccounts();
        } else if (!this.error()) {
          this.error.set('Le compte demandé est introuvable.');
        }
      });
  }

  loadOtherAccounts() {
    this.bankService.getAllAccounts().subscribe((data) => {
      this.otherAccounts = data.filter((acc) => acc.id !== this.account?.id);
    });
  }

  onDeposit() {
    if (this.depositForm.invalid || !this.account) return;
    this.submitting = true;
    const payload = {
      sourceAccount: { id: this.account.id! },
      amount: this.depositForm.value.amount,
      description: this.depositForm.value.description,
    };

    this.bankService
      .deposit(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Dépôt effectué avec succès');
          this.depositForm.reset({ amount: null, description: 'Dépôt au guichet' });
          this.loadAccountDetails(this.account!.id!);
        },
        error: (err) =>
          this.ns.showError('Erreur: ' + (err.error?.message || 'Transaction échouée')),
      });
  }

  onWithdraw() {
    if (this.withdrawForm.invalid || !this.account) return;
    this.submitting = true;
    const payload = {
      sourceAccount: { id: this.account.id! },
      amount: this.withdrawForm.value.amount,
      description: this.withdrawForm.value.description,
    };

    this.bankService
      .withdraw(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Retrait effectué avec succès');
          this.withdrawForm.reset({ amount: null, description: 'Retrait au guichet' });
          this.loadAccountDetails(this.account!.id!);
        },
        error: (err) =>
          this.ns.showError('Erreur: ' + (err.error?.message || 'Transaction échouée')),
      });
  }

  onTransfer() {
    if (this.transferForm.invalid || !this.account) return;
    this.submitting = true;
    const payload = {
      sourceAccount: { id: this.account.id! },
      destinationAccount: { id: parseInt(this.transferForm.value.destinationAccountId) },
      amount: this.transferForm.value.amount,
      description: this.transferForm.value.description,
    };

    this.bankService
      .transfer(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.ns.showSuccess('Virement effectué avec succès');
          this.transferForm.reset({
            destinationAccountId: '',
            amount: null,
            description: 'Virement bancaire',
          });
          this.loadAccountDetails(this.account!.id!);
        },
        error: (err) =>
          this.ns.showError('Erreur: ' + (err.error?.message || 'Transaction échouée')),
      });
  }

  deleteAccount() {
    if (!this.account?.id) return;
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.')) {
      this.bankService.deleteAccount(this.account.id).subscribe({
        next: () => {
          this.ns.showSuccess('Compte supprimé avec succès');
          this.router.navigate(['/dashboard/admin/accounts']);
        },
        error: (err) => {
          this.ns.showError('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  }
}
