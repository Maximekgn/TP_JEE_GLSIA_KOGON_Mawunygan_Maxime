import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankService, Client } from '../../../core/services/bank.service';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-clients-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6" *ngIf="clients$ | async as clients">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Gestion des Clients</h2>
        <span
          class="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
        >
          {{ clients.length }} Clients total
        </span>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse" *ngIf="clients.length > 0">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Comptes
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Nationalité
                </th>
                <th
                  class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr *ngFor="let client of clients" class="hover:bg-slate-50 transition-colors group">
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div
                      class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 uppercase"
                    >
                      {{ (client.firstName || '?')[0] }}{{ (client.lastName || '?')[0] }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-800">
                        {{ client.firstName }} {{ client.lastName }}
                      </div>
                      <div class="text-xs text-slate-500 italic">ID: #{{ client.id }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-700 font-medium">{{ client.email }}</div>
                  <div class="text-xs text-slate-500">{{ client.phoneNumber }}</div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-800">
                      {{ client.accounts?.length || 0 }} Compte(s)
                    </span>
                    <span
                      class="text-xs text-slate-500"
                      *ngIf="client.accounts && client.accounts.length > 0"
                    >
                      Total: {{ getTotalBalance(client) | number : '1.2-2' }} FCFA
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-700">{{ client.address || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4">
                  <div
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {{ client.nationality || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
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
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="clients.length === 0" class="p-16 text-center">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <p class="text-slate-500 font-medium">Aucun client trouvé.</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AdminClientsListComponent implements OnInit {
  private bankService = inject(BankService);
  clients$: Observable<Client[]> = of([]);

  ngOnInit(): void {
    this.clients$ = this.bankService.getAllClients().pipe(
      catchError((err) => {
        console.error('Error loading clients', err);
        return of([]);
      })
    );
  }

  getTotalBalance(client: Client): number {
    if (!client.accounts) return 0;
    return client.accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  }
}
