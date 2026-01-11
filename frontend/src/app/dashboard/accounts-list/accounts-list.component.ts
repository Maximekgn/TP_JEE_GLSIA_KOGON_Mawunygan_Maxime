import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-accounts-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6" *ngIf="accounts$ | async as accounts">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Gestion des Comptes</h2>
        <span
          class="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
        >
          {{ accounts.length }} Comptes total
        </span>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse" *ngIf="accounts.length > 0">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Compte
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Solde
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Date de création
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                *ngFor="let account of accounts"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold border border-slate-700"
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
                          d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 5.25v.75m0 5.25v.75m15-12.75V4.5m0 5.25v.75m0 5.25v.75m-15 0h.008v.008H3.75V16.5zm15 0h.008v.008h-.008V16.5zm-15-5.25h.008v.008H3.75v-.008zm15 0h.008v.008h-.008v-.008zm-15-5.25h.008v.008H3.75V6zm15 0h.008v.008h-.008V6zm-12.25 0h11.5c.663 0 1.25.537 1.25 1.25v11.5c0 .663-.537 1.25-1.25 1.25h-11.5c-.663 0-1.25-.537-1.25-1.25V7.25c0-.663.537-1.25 1.25-1.25z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">{{ account.accountNumber }}</div>
                      <div class="text-xs text-slate-500 italic">ID: #{{ account.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900">
                    {{ account.owner?.firstName }} {{ account.owner?.lastName }}
                  </div>
                  <div class="text-xs text-slate-500">{{ account.owner?.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <div
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    [ngClass]="
                      account.accountType === 'SAVINGS'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    "
                  >
                    {{ account.accountType === 'SAVINGS' ? 'Epargne' : 'Courant' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="font-bold text-slate-900">
                    {{ account.balance | number : '1.2-2' }} FCFA
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-slate-600">
                  {{ account.creationDate || account.createdAt | date : 'dd/MM/yyyy' }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider hover:underline"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="accounts.length === 0" class="p-16 text-center">
          <div
            class="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-8 h-8 text-slate-300"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">Aucun compte trouvé.</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AdminAccountsListComponent implements OnInit {
  private bankService = inject(BankService);
  accounts$: Observable<Account[]> = of([]);

  ngOnInit(): void {
    this.accounts$ = this.bankService.getAllAccounts().pipe(
      catchError((err) => {
        console.error('Error loading accounts', err);
        return of([]);
      })
    );
  }
}
