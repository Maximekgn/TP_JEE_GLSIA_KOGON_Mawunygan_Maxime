import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BankService, Client } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { of, timeout, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-clients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div *ngIf="loading()" class="flex flex-col items-center justify-center py-32 space-y-4">
      <div
        class="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"
      ></div>
      <p class="text-slate-500 font-medium animate-pulse">Chargement de la liste des clients...</p>
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
      <h3 class="text-lg font-bold mb-2">Erreur de chargement</h3>
      <p class="mb-6">{{ error() }}</p>
      <button
        (click)="loadClients()"
        class="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
      >
        Réessayer
      </button>
    </div>

    <div class="space-y-6" *ngIf="!loading() && !error()">
      <div class="flex flex-col space-y-4">
        <h2 class="text-2xl font-bold text-slate-800">Gestion des Clients</h2>
        <div class="flex justify-end">
          <button
            type="button"
            (click)="goToCreateClient()"
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
            Ajouter un client
          </button>
        </div>
      </div>

      <!-- Filtres de recherche -->
      <div class="bg-white p-6 border border-slate-200 shadow-sm rounded-xl">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="md:col-span-2 relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="Rechercher par nom, prénom ou email..."
              class="w-full pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <select
              [(ngModel)]="genderFilter"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Tous les genres</option>
              <option value="M">Masculin</option>
              <option value="F">Féminin</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              [(ngModel)]="dateFilter"
              (ngModelChange)="applyFilters()"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div class="bg-white shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse" *ngIf="filteredClients.length > 0">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-200">
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Contact
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
              <tr
                *ngFor="let client of filteredClients"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-3">
                    <div>
                      <div class="font-bold text-slate-800">
                        {{ client.first_name }} {{ client.last_name }}
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
                  <div
                    class="inline-flex items-center px-2.5 py-0.5  text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {{ client.nationality || 'N/A' }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end space-x-1">
                    <a
                      [routerLink]="['/dashboard/admin/clients', client.id]"
                      class="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                      title="Voir détails"
                    >
                      Voir détails
                    </a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="filteredClients.length === 0" class="p-16 text-center">
          <div class="w-16 h-16 bg-slate-50  flex items-center justify-center mx-auto mb-4">
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
  private ns = inject(NotificationService);
  private router = inject(Router);

  allClients: Client[] = [];
  filteredClients: Client[] = [];
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  searchTerm = '';
  genderFilter = '';
  dateFilter = '';

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    console.log('[ClientsList] loadClients() -> start');
    this.loading.set(true);
    this.error.set(null);

    this.bankService
      .getAllClients()
      .pipe(
        tap(() => console.log('[ClientsList] HTTP request started')),
        timeout(5000),
        tap((data) =>
          console.log('[ClientsList] HTTP response received', {
            type: typeof data,
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : undefined,
            sample: Array.isArray(data) ? data.slice(0, 1) : data,
          }),
        ),
        catchError((err) => {
          console.error('[ClientsList] Error loading clients (pipe)', err);
          if (err?.name === 'TimeoutError') {
            this.error.set('Le serveur met trop de temps à répondre (Timeout).');
          } else {
            this.error.set(
              'Impossible de charger les clients. Le serveur est peut-être hors ligne ou injoignable.',
            );
          }
          this.loading.set(false);
          console.log('[ClientsList] loading=false (catchError)');
          return of([]);
        }),
      )
      .subscribe({
        next: (data) => {
          console.log('[ClientsList] subscribe.next()', {
            isArray: Array.isArray(data),
            length: Array.isArray(data) ? data.length : undefined,
          });

          this.allClients = Array.isArray(data) ? data : [];
          this.applyFilters();

          this.loading.set(false);
          console.log('[ClientsList] loading=false (next)', {
            allClients: this.allClients.length,
            filteredClients: this.filteredClients.length,
          });
        },
        error: (err) => {
          console.error('[ClientsList] subscribe.error()', err);
          this.error.set(this.error() || 'Erreur inattendue lors du chargement des clients.');
          this.loading.set(false);
          console.log('[ClientsList] loading=false (error)');
        },
        complete: () => {
          console.log('[ClientsList] subscribe.complete()');
          this.loading.set(false);
          console.log('[ClientsList] loading=false (complete)');
        },
      });
  }

  applyFilters() {
    const term = (this.searchTerm || '').toLowerCase();

    this.filteredClients = (this.allClients || []).filter((c) => {
      const firstName = (c?.first_name || '').toLowerCase();
      const lastName = (c?.last_name || '').toLowerCase();
      const email = (c?.email || '').toLowerCase();

      const matchesSearch =
        firstName.includes(term) || lastName.includes(term) || email.includes(term);

      const matchesGender = !this.genderFilter || c?.gender === this.genderFilter;

      const createdAt = c?.createdAt || '';
      const matchesDate = !this.dateFilter || createdAt.includes(this.dateFilter);

      return matchesSearch && matchesGender && matchesDate;
    });
  }

  goToCreateClient() {
    this.router.navigate(['/dashboard/admin/clients/create']);
  }

  deleteClient(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      this.bankService.deleteClient(id).subscribe({
        next: () => {
          this.ns.showSuccess('Client supprimé avec succès');
          this.loadClients();
        },
        error: (err) => {
          this.ns.showError('Erreur lors de la suppression');
          console.error(err);
        },
      });
    }
  }

  getTotalBalance(client: Client): number {
    if (!client.accounts) return 0;
    return client.accounts.reduce((sum: number, account: any) => sum + (account.balance || 0), 0);
  }
}
