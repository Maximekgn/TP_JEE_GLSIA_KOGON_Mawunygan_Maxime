import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCreditCard, heroExclamationCircle } from '@ng-icons/heroicons/outline';
import { BankService, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { DataTableComponent, DataTableColumn } from '../../shared/components/ui/data-table/data-table.component';
import { catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-admin-accounts-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, NgIcon],
  viewProviders: [
    provideIcons({ heroCreditCard, heroExclamationCircle })
  ],
  template: `
    <div *ngIf="loading()" class="flex flex-col items-center justify-center py-32 space-y-4">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      <p class="text-slate-500 font-medium animate-pulse">Chargement des comptes...</p>
    </div>

    <div *ngIf="error()" class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl max-w-2xl mx-auto my-12 text-center">
      <div class="mb-4 flex justify-center">
        <ng-icon name="heroExclamationCircle" size="3rem"></ng-icon>
      </div>
      <h3 class="text-lg font-bold mb-2">Erreur de chargement</h3>
      <p class="mb-6">{{ error() }}</p>
      <button (click)="loadAccounts()" class="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
        Réessayer
      </button>
    </div>

    <div class="space-y-6" *ngIf="!loading() && !error()">
      <div class="flex items-center justify-between gap-4 mb-8">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm border border-blue-100/50">
            <ng-icon name="heroCreditCard" size="1.5rem"></ng-icon>
          </div>
          <div>
            <h2 class="text-3xl font-black text-slate-900 tracking-tight">Gestion des Comptes</h2>
            <p class="text-slate-500 text-sm font-medium">Visualisez et gérez l'ensemble des comptes bancaires.</p>
          </div>
        </div>
        <button
          (click)="goToCreate()"
          class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
        >
          <span class="text-xl leading-none">+</span>
          Ajouter un compte
        </button>
      </div>

      <app-data-table
        [data]="allAccounts"
        [columns]="columns"
        [loading]="loading()"
        [searchable]="true"
        searchPlaceholder="Rechercher (Numéro, Client)..."
        [itemsPerPage]="10"
        [hoverable]="true"
        (onRowClick)="onTableAction($event)"
      ></app-data-table>
    </div>
  `,
  styles: [],
})
export class AdminAccountsListComponent implements OnInit {
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private router = inject(Router);

  allAccounts: Account[] = [];
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  columns: DataTableColumn<Account>[] = [
    {
      key: 'accountNumber',
      header: 'Compte',
      sortable: true,
      filterable: true,
      render: (val, row) => `
        <div class="font-bold text-blue-600 hover:text-blue-800 transition-colors">${val}</div>
        <div class="text-xs text-slate-500 italic">ID: #${row.id}</div>
      `,
    },
    {
      key: 'owner',
      header: 'Propriétaire',
      sortable: true,
      filterable: true,
      render: (val, row) => `
        <div class="font-medium text-slate-900">
          ${row.owner?.first_name} ${row.owner?.last_name}
        </div>
        <div class="text-xs text-slate-500">${row.owner?.email}</div>
      `,
    },
    {
      key: 'accountType',
      header: 'Type',
      sortable: true,
      filterable: true,
      render: (val) => `
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          val === 'COURANT'
            ? 'bg-blue-100 text-blue-700'
            : val === 'EPARGNE' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-slate-100 text-slate-700'
        }">
          ${val}
        </span>
      `,
    },
    {
      key: 'balance',
      header: 'Solde',
      sortable: true,
      render: (val) => `
        <div class="font-black text-slate-900 text-right">
          ${new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2 }).format(val)} FCFA
        </div>
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
          <button class="delete-btn p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer" title="Supprimer le compte">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 12.142m-4.204 3.69.255-1.166m.512-2.333M7.5 7h9m-9 0a2 2 0 0 0-2 2v1h11V9a2 2 0 0 0-2-2m-9 0h9m-11 5h13m-13 4h13m-13 4h13" />
            </svg>
          </button>
        </div>
      `,
    },
  ];

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading.set(true);
    this.error.set(null);

    this.bankService
      .getAllAccounts()
      .pipe(
        catchError((err) => {
          console.error('Error loading accounts', err);
          this.error.set('Impossible de charger la liste des comptes.');
          return of([]);
        }),
        finalize(() => this.loading.set(false))
      )
      .subscribe((data) => {
        this.allAccounts = data;
      });
  }

  onTableAction(event: { row: Account; index: number; event: MouseEvent }) {
    const target = event.event.target as HTMLElement;
    const btn = target.closest('button');
    
    if (btn?.classList.contains('delete-btn')) {
      event.event.stopPropagation();
      this.deleteAccount(event.row.id!);
    } else {
      this.goToDetails(event.row.id!);
    }
  }

  goToDetails(id: number) {
    this.router.navigate(['/dashboard/admin/accounts', id]);
  }

  goToCreate() {
    this.router.navigate(['/dashboard/admin/accounts/create']);
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
