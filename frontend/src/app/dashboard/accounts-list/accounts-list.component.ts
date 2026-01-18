import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-admin-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-4 mb-6">
        <div class="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
          </svg>
        </div>
        <div>
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">Gestion des Comptes</h2>
          <p class="text-slate-500 text-sm font-medium">Visualisez et gérez l'ensemble des comptes bancaires.</p>
        </div>
      </div>
        <div class="flex justify-end">
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5 mr-2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter un compte
          </button>
        </div>
      </div>

      <!-- Filtres de recherche -->
      <div class="bg-white p-6 border border-slate-200 shadow-sm rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-1 relative">
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1"
              >Recherche</label
            >
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Numéro de compte, nom du client..."
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1"
              >Type de compte</label
            >
            <select
              [(ngModel)]="typeFilter"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="">Tous les types</option>
              <option value="COURANT">Courant</option>
              <option value="EPARGNE">Épargne</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1"
              >Solde minimum</label
            >
            <input
              type="number"
              [(ngModel)]="minBalance"
              placeholder="Ex: 1000"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 overflow-hidden rounded-xl">
        <div class="overflow-x-auto">
          <table
            class="w-full text-left border-collapse"
            *ngIf="filteredAccounts().length > 0; else noData"
          >
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
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr
                *ngFor="let account of filteredAccounts()"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <div>
                    <a
                      [routerLink]="['/dashboard/admin/accounts', account.id]"
                      class="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {{ account.accountNumber }}
                    </a>
                    <div class="text-xs text-slate-500 italic">ID: #{{ account.id }}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-slate-900">
                    {{ account.owner?.first_name }} {{ account.owner?.last_name }}
                  </div>
                  <div class="text-xs text-slate-500">{{ account.owner?.email }}</div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                    [ngClass]="{
                      'bg-blue-100 text-blue-700': account.accountType === 'COURANT',
                      'bg-fuchsia-100 text-fuchsia-700': account.accountType === 'EPARGNE',
                    }"
                  >
                    {{ account.accountType }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="font-black text-slate-900">
                    {{ account.balance | number: '1.2-2' }} FCFA
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end space-x-2">
                    <a
                      [routerLink]="['/dashboard/admin/clients', account.owner?.id]"
                      class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Voir le propriétaire"
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
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                        />
                      </svg>
                    </a>
                    <button
                      (click)="deleteAccount(account.id!); $event.stopPropagation()"
                      class="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Supprimer le compte"
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
                          d="m14.74 9-.34 12.142m-4.204 3.69.255-1.166m.512-2.333M7.5 7h9m-9 0a2 2 0 0 0-2 2v1h11V9a2 2 0 0 0-2-2m-9 0h9m-11 5h13m-13 4h13m-13 4h13"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
                </tr>
              </tbody>
            </table>

          <ng-template #noData>
            <div class="p-16 text-center" *ngIf="!isLoading()">
              <div
                class="w-16 h-16 bg-slate-50 flex items-center justify-center mx-auto mb-4 rounded-full"
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
              <p class="text-slate-500 font-medium">Aucun compte ne correspond à vos critères.</p>
            </div>

            <div *ngIf="isLoading()" class="p-16 text-center">
              <div
                class="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"
              ></div>
              <p class="text-slate-500">Chargement des comptes...</p>
            </div>
          </ng-template>
        </div>
      </div>

  `,
  styles: [],
})
export class AdminAccountsListComponent implements OnInit {
  private bankService = inject(BankService);
  private ns = inject(NotificationService);

  // States using Signals
  allAccounts = signal<Account[]>([]);
  isLoading = signal<boolean>(false);

  // Filter states
  searchTerm = signal<string>('');
  typeFilter = signal<string>('');
  minBalance = signal<number | null>(null);

  // Computed signal for filtered results
  filteredAccounts = computed(() => {
    const accounts = this.allAccounts();
    const term = this.searchTerm().toLowerCase();
    const type = this.typeFilter();
    const min = this.minBalance();

    return accounts.filter((acc) => {
      const matchesSearch =
        acc.accountNumber?.toLowerCase().includes(term) ||
        acc.owner?.first_name.toLowerCase().includes(term) ||
        acc.owner?.last_name.toLowerCase().includes(term) ||
        acc.owner?.email.toLowerCase().includes(term);

      const matchesType = !type || acc.accountType === type;
      const matchesBalance = min === null || (acc.balance || 0) >= min;

      return matchesSearch && matchesType && matchesBalance;
    });
  });

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.isLoading.set(true);
    this.bankService
      .getAllAccounts()
      .pipe(
        catchError((err) => {
          console.error('Error loading accounts', err);
          this.ns.showError('Erreur lors du chargement des comptes');
          return of([]);
        }),
      )
      .subscribe((data) => {
        this.allAccounts.set(data);
        this.isLoading.set(false);
      });
  }

  deleteAccount(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
      this.bankService.deleteAccount(id).subscribe({
        next: () => {
          this.ns.showSuccess('Compte supprimé avec succès');
          this.loadAccounts();
        },
        error: (err) => {
          this.ns.showError('Erreur lors de la suppression');
          console.error(err);
        },
      });
    }
  }
}
