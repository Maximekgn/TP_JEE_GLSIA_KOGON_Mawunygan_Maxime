import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroExclamationCircle, heroUsers, heroPencilSquare, heroTrash } from '@ng-icons/heroicons/outline';
import { BankService, Client } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { DataTableComponent, DataTableColumn } from '../../shared/components/ui/data-table/data-table.component';
import { of, timeout, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-clients-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, NgIcon],
  viewProviders: [
    provideIcons({ heroExclamationCircle, heroUsers, heroPencilSquare, heroTrash })
  ],
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
      <div class="mb-4 flex justify-center">
        <ng-icon name="heroExclamationCircle" size="3rem"></ng-icon>
      </div>
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
      <div class="flex items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
            <ng-icon name="heroUsers" size="1.5rem"></ng-icon>
          </div>
          <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Gestion des Clients</h2>
            <p class="text-slate-500 text-sm font-medium">Administrez la base des clients et leurs informations.</p>
          </div>
        </div>
        <button
          (click)="goToCreate()"
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          <span class="text-xl leading-none">+</span>
          Ajouter un client
        </button>
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
        <div class="flex items-center justify-end gap-2 pr-4">
           <button class="view-btn text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors cursor-pointer" title="Voir détails">
            <span class="text-sm font-semibold">Voir détails</span>
          </button>
          <button class="edit-btn p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer" title="Modifier">
             <!-- Using a simple SVG for now as ng-icon inside render string is tricky without proper component integration -->
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </button>
          <button class="delete-btn p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Supprimer">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
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
    } else if (btn?.classList.contains('edit-btn')) {
      event.event.stopPropagation();
      this.goToEdit(event.row.id!);
    } else if (btn?.classList.contains('view-btn')) {
        this.goToDetails(event);
    } else {
      this.goToDetails(event);
    }
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.loading.set(true);
    this.error.set(null);

    this.bankService
      .getAllClients()
      .pipe(
        timeout(5000),
        catchError((err) => {
          console.error('[ClientsList] Error loading clients (pipe)', err);
          this.error.set('Impossible de charger les clients.');
          this.loading.set(false);
          return of([]);
        }),
      )
      .subscribe({
        next: (data) => {
          this.allClients = Array.isArray(data) ? data : [];
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Erreur inattendue.');
          this.loading.set(false);
        }
      });
  }

  goToDetails(event: { row: Client; index: number; event: MouseEvent }) {
    this.router.navigate(['/dashboard/admin/clients', event.row.id]);
  }

  goToEdit(id: number) {
      this.router.navigate(['/dashboard/admin/clients/edit', id]);
  }

  goToCreate() {
    this.router.navigate(['/dashboard/admin/clients/create']);
  }

  deleteClient(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cela supprimera également tous ses comptes et transactions.')) {
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
}
