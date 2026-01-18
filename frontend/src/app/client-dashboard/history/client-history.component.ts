import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPrinter, heroArrowPath, heroInboxStack, heroFunnel } from '@ng-icons/heroicons/outline';
import { BankService, Account, Transaction } from '../../../security/core/services/bank.service';
import { ClientAuthService } from '../../../security/core/services/client-auth.service';
import { of } from 'rxjs';
import { finalize, switchMap, take } from 'rxjs/operators';

import type { Transaction as DetailedTransaction } from '../../shared/components/transaction-details/transaction-details.component';

@Component({
  selector: 'app-client-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  viewProviders: [
    provideIcons({ heroPrinter, heroArrowPath, heroInboxStack, heroFunnel })
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-end gap-4 print:hidden">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Historique des Opérations</h1>
          <p class="text-slate-500">Consultez vos relevés et exportez vos transactions.</p>
        </div>
        <button
          (click)="print()"
          class="px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          <ng-icon name="heroPrinter" size="1.25rem"></ng-icon>
          Imprimer Relevé
        </button>
      </div>

      <!-- Filters -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:hidden">
        <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Compte</label>
            <select
              formControlName="accountId"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500 transition-all font-medium"
            >
              <option value="">Tous les comptes</option>
              <option *ngFor="let acc of accounts$ | async" [value]="acc.id">
                {{ acc.accountNumber }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date Début</label>
            <input
              type="date"
              formControlName="startDate"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Date Fin</label>
            <input
              type="date"
              formControlName="endDate"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <button
            (click)="loadTransactions()"
            [disabled]="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-blue-100"
          >
            <ng-icon *ngIf="loading" name="heroArrowPath" size="1rem" class="animate-spin"></ng-icon>
            <ng-icon *ngIf="!loading" name="heroFunnel" size="1rem"></ng-icon>
            {{ loading ? 'Chargement...' : 'Filtrer' }}
          </button>
        </form>
      </div>

      <!-- Statement View -->
      <div
        class="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden print:shadow-none print:border-none min-h-[400px] relative"
      >
        <!-- Loading Overlay -->
        <div *ngIf="loading" class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
            <div class="relative w-12 h-12">
              <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div class="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p class="text-slate-500 text-sm font-medium mt-4">Mise à jour de l'historique...</p>
        </div>

        <!-- Print Header -->
        <div class="hidden print:block p-8 border-b border-gray-200">
          <div class="flex justify-between">
            <div>
              <h1 class="text-3xl font-bold text-slate-900">E-Bank</h1>
              <p class="text-sm text-slate-500">Relevé de Compte Client</p>
            </div>
            <div class="text-right">
              <h2 class="font-bold text-lg">{{ clientFullName }}</h2>
              <p class="text-sm text-slate-500">Client ID: #{{ CLIENT_ID }}</p>
              <p class="text-sm text-slate-500">Edité le {{ today | date: 'dd/MM/yyyy HH:mm' }}</p>
            </div>
          </div>
        </div>

        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr
                  class="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest"
                >
                  <th class="p-6 cursor-pointer hover:bg-slate-100 transition-colors" (click)="sort('date')">Date</th>
                  <th class="p-6">Description</th>
                  <th class="p-6 cursor-pointer hover:bg-slate-100 transition-colors" (click)="sort('type')">Type</th>
                  <th class="p-6 text-right cursor-pointer hover:bg-slate-100 transition-colors" (click)="sort('amount')">
                    Montant
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr *ngFor="let tx of transactions" (click)="viewTransactionDetails(tx)" class="hover:bg-slate-50/50 transition-colors group cursor-pointer">
                  <td class="p-6 text-slate-500 text-sm font-medium">
                    {{ tx.transactionDate | date: 'dd/MM/yyyy HH:mm' }}
                  </td>
                  <td class="p-6">
                    <div class="font-bold text-slate-800">{{ tx.description }}</div>
                    <div class="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">Référence: TXN-{{ tx.id }}</div>
                  </td>
                  <td class="p-6">
                    <span
                      class="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      [ngClass]="{
                        'bg-green-100 text-green-700': tx.transactionType === 'DEPOSIT',
                        'bg-red-100 text-red-700': tx.transactionType === 'WITHDRAWAL',
                        'bg-blue-100 text-blue-700': tx.transactionType === 'TRANSFER',
                      }"
                    >
                      {{ tx.transactionType }}
                    </span>
                  </td>
                  <td
                    class="p-6 text-right font-bold font-mono text-sm"
                    [ngClass]="
                      tx.transactionType === 'DEPOSIT' ||
                      (tx.transactionType === 'TRANSFER' && isCredit(tx))
                        ? 'text-green-600'
                        : 'text-slate-900'
                    "
                  >
                    {{ isCredit(tx) ? '+' : '-' }} {{ tx.amount | number: '1.0-0' }} <span class="text-[10px] font-normal text-slate-400 ml-1">FCFA</span>
                  </td>
                </tr>
                <tr *ngIf="transactions.length === 0 && !loading">
                  <td colspan="4" class="p-24 text-center">
                    <div class="flex flex-col items-center justify-center space-y-3">
                        <div class="p-4 bg-slate-50 rounded-full">
                            <ng-icon name="heroInboxStack" size="2.5rem" class="text-slate-300"></ng-icon>
                        </div>
                        <p class="text-slate-400 font-medium">Aucune transaction trouvée pour cette période.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @media print {
        :host {
          display: block;
          background: white;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 9999;
        }
        .print\\:hidden {
          display: none !important;
        }
        .print\\:block {
          display: block !important;
        }
      }
    `,
  ],
})
export class ClientHistoryComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(ClientAuthService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  
  readonly CLIENT_ID = this.authService.getUserId() || 1;
  clientFullName: string = '';

  accounts$ = this.bankService.getMyAccounts();
  transactions: Transaction[] = [];
  today = new Date();
  loading = false;

  filterForm = this.fb.group({
    accountId: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit() {
    this.clientFullName = this.authService.getUserFullName();
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.cdr.detectChanges();
    const { accountId, startDate, endDate } = this.filterForm.value;

    if (accountId) {
      const id = parseInt(accountId);
      
      this.bankService.getMyAccountStatement(id, startDate || undefined, endDate || undefined)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })).subscribe(data => {
          this.transactions = data.transactions || [];
          this.cdr.detectChanges();
        });

    } else {
      this.bankService.getMyAllTransactions(startDate || undefined, endDate || undefined)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })).subscribe(data => {
          this.transactions = data || [];
          this.cdr.detectChanges();
        });
    }
  }

  isCredit(tx: Transaction): boolean {
    if (tx.transactionType === 'DEPOSIT') return true;
    if (tx.transactionType === 'WITHDRAWAL') return false;
    return false;
  }

  viewTransactionDetails(tx: Transaction) {
    this.router.navigate(['/client/dashboard/transactions', tx.id]);
  }

  sort(column: string) {
    this.transactions.sort((a: any, b: any) => {
      if (column === 'amount') return b.amount - a.amount;
      if (column === 'date')
        return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
      return 0;
    });
  }

  print() {
    window.print();
  }
}
