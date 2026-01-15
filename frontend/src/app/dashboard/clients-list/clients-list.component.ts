import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BankService, Client } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { DataTableComponent, DataTableColumn } from '../../shared/components/ui/data-table/data-table.component';
import { of, timeout, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-clients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
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
      </div>

      <app-data-table
        [data]="allClients"
        [columns]="columns"
        [loading]="loading()"
        [searchable]="true"
        searchPlaceholder="Rechercher un client..."
        [itemsPerPage]="10"
        [striped]="false"
        [hoverable]="true"
        (onRowClick)="onTableAction($event)"
      ></app-data-table>
    </div>
  `,
  styles: [],
})
export class AdminClientsListComponent implements OnInit {
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private router = inject(Router);

  allClients: Client[] = [];
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  columns: DataTableColumn<Client>[] = [
    {
      key: 'last_name',
      header: 'Client',
      sortable: true,
      filterable: true,
      render: (val, row) => `
        <div class="font-bold text-slate-800">${row.first_name} ${row.last_name}</div>
        <div class="text-xs text-slate-500 italic">ID: #${row.id}</div>
      `,
    },
    {
      key: 'email',
      header: 'Contact',
      sortable: true,
      filterable: true,
      render: (val, row) => `
        <div class="text-sm text-slate-700 font-medium">${row.email}</div>
        <div class="text-xs text-slate-500">${row.phoneNumber}</div>
      `,
    },
    {
      key: 'nationality',
      header: 'Nationalité',
      sortable: true,
      filterable: true,
      render: (val) => `
        <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 rounded">
          ${val || 'N/A'}
        </span>
      `,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (val, row) => `
        <div class="flex items-center justify-end gap-3 pr-4">
          <button class="view-btn text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors cursor-pointer">
            Voir détails →
          </button>
          <button class="delete-btn p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Supprimer le client">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 12.142m-4.204 3.69.255-1.166m.512-2.333M7.5 7h9m-9 0a2 2 0 0 0-2 2v1h11V9a2 2 0 0 0-2-2m-9 0h9m-11 5h13m-13 4h13m-13 4h13" />
            </svg>
          </button>
        </div>
      `,
    },
  ];

  onTableAction(event: { row: Client; index: number; event: MouseEvent }) {
    const target = event.event.target as HTMLElement;
    const btn = target.closest('button');
    
    if (btn?.classList.contains('delete-btn')) {
      event.event.stopPropagation();
      this.deleteClient(event.row.id!);
    } else {
      this.goToDetails(event);
    }
  }

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

          this.loading.set(false);
          console.log('[ClientsList] loading=false (next)', {
            allClients: this.allClients.length,
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

  goToDetails(event: { row: Client; index: number; event: MouseEvent }) {
    this.router.navigate(['/dashboard/admin/clients', event.row.id]);
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
