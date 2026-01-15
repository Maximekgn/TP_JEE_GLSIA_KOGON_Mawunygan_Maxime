import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankService, Client, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { catchError, forkJoin, map, of, finalize } from 'rxjs';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-8" *ngIf="client(); else stateView">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <a
              routerLink="/dashboard/admin/clients"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </a>
            <h2 class="text-xl font-bold text-slate-900">Détails du Client</h2>
          </div>
          <p class="text-slate-500 ml-11">
            Consulter les informations personnelles et les comptes de {{ client()?.first_name }}
            {{ client()?.last_name }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            (click)="isEditing = true"
            class="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-blue-600">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>
            Modifier
          </button>
          
          <button
            (click)="deleteClient()"
            class="px-4 py-2 bg-white border border-slate-200 text-rose-600 font-bold rounded-xl hover:bg-rose-50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.34 12.142m-4.204 3.69.255-1.166m.512-2.333M7.5 7h9m-9 0a2 2 0 0 0-2 2v1h11V9a2 2 0 0 0-2-2m-9 0h9m-11 5h13m-13 4h13m-13 4h13" />
            </svg>
            Supprimer
          </button>

          <span
            [class]="
              client()?.active !== false
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700'
            "
            class="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ml-4"
          >
            {{ client()?.active !== false ? 'Compte Actif' : 'Compte Inactif' }}
          </span>
        </div>
      </div>

      <!-- Edit Modal Overlay -->
      <div *ngIf="isEditing" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="isEditing = false"></div>
        <div class="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
           <div class="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 class="text-xl font-bold text-slate-900">Modifier les informations</h3>
              <button (click)="isEditing = false" class="text-slate-400 hover:text-slate-600 transition-colors">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           <div class="p-8">
              <form [formGroup]="editForm" (ngSubmit)="onUpdateClient()" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Prénom</label>
                    <input type="text" formControlName="first_name" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Nom</label>
                    <input type="text" formControlName="last_name" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                    <input type="email" formControlName="email" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium transition-all" />
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Téléphone</label>
                    <input type="tel" formControlName="phoneNumber" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium transition-all" />
                  </div>
                </div>
                
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-widest">Adresse</label>
                  <textarea formControlName="address" rows="3" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl outline-none font-medium transition-all resize-none"></textarea>
                </div>

                <div class="flex gap-4 pt-4">
                  <button type="button" (click)="isEditing = false" class="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">Annuler</button>
                  <button type="submit" [disabled]="editForm.invalid || isUpdating" class="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                    <span *ngIf="isUpdating" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
           </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Profile Card -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div
              class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-12 h-12"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </div>

            <div class="text-center space-y-1">
              <h3 class="text-xl font-bold text-slate-900">
                {{ client()?.first_name }} {{ client()?.last_name }}
              </h3>
              <p class="text-slate-500 text-sm">{{ client()?.email }}</p>
            </div>

            <div class="pt-6 border-t border-slate-100 space-y-4 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500">Genre</span>
                <span class="font-semibold text-slate-700">{{
                  client()?.gender === 'M' ? 'Masculin' : 'Féminin'
                }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Nationalité</span>
                <span class="font-semibold text-slate-700">{{ client()?.nationality }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Téléphone</span>
                <span class="font-semibold text-slate-700">{{ client()?.phoneNumber }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500">Date de Naissance</span>
                <span class="font-semibold text-slate-700">{{
                  client()?.birthDate | date: 'mediumDate'
                }}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-900 p-8 rounded-xl text-white space-y-4">
            <h4 class="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Adresse de Résidence
            </h4>
            <p class="text-lg leading-relaxed">{{ client()?.address }}</p>
          </div>
        </div>

        <!-- Accounts List -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <div class="flex items-center gap-4">
                <h3 class="font-bold text-slate-900 text-lg">Comptes Bancaires</h3>
                <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {{ client()?.accounts?.length || 0 }} au total
                </span>
              </div>
              <a
                [routerLink]="['/dashboard/admin/accounts/create']"
                [queryParams]="{ clientId: client()?.id }"
                class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-4 h-4"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Ouvrir un nouveau compte
              </a>
            </div>

            <div class="divide-y divide-slate-100">
              <div
                *ngFor="let acc of client()?.accounts"
                class="p-6 hover:bg-slate-50 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <div
                      [class]="
                        acc.accountType === 'COURANT'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-fuchsia-100 text-fuchsia-600'
                      "
                      class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs"
                    >
                      {{ acc.accountType === 'COURANT' ? 'CR' : 'EP' }}
                    </div>
                    <div>
                      <div class="font-bold text-slate-900">
                        {{ acc.accountNumber }}
                      </div>
                      <div class="text-sm text-slate-500">{{ acc.accountType }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-6">
                    <div class="text-right">
                      <div class="text-xl font-black text-slate-900">
                        {{ acc.balance | number: '1.2-2' }} FCFA
                      </div>
                      <div class="text-xs text-slate-400">Solde disponible</div>
                    </div>
                    <a
                      [routerLink]="['/dashboard/admin/accounts', acc.id]"
                      class="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center gap-2"
                    >
                      Détails
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="w-3 h-3"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div
                *ngIf="!client()?.accounts || client()?.accounts?.length === 0"
                class="p-12 text-center text-slate-400"
              >
                <p>Ce client n'a aucun compte bancaire actif.</p>
              </div>
            </div>

            <div
              class="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center"
            >
              <span class="text-sm font-semibold text-slate-600">Total des avoirs</span>
              <span class="text-2xl font-black text-slate-900"
                >{{ getTotalBalance() | number: '1.2-2' }} FCFA</span
              >
            </div>
          </div>

          <!-- Metadata -->
          <div class="flex items-center gap-6 text-xs text-slate-400 px-4">
            <div>
              Inscrit le : <b>{{ client()?.createdAt | date: 'longDate' }}</b>
            </div>
            <div>
              Dernière modification : <b>{{ client()?.updatedAt | date: 'short' }}</b>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- State View (Loading or Error) -->
    <ng-template #stateView>
      <div class="flex flex-col items-center justify-center py-32 space-y-4 text-center">
        <ng-container *ngIf="errorMessage(); else loadingSpinner">
          <div
            class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-8 h-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-slate-900">Oups !</h3>
          <p class="text-slate-500 max-w-md">{{ errorMessage() }}</p>
          <a
            routerLink="/dashboard/admin/clients"
            class="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all"
          >
            Retour à la liste
          </a>
        </ng-container>

        <ng-template #loadingSpinner>
          <div
            class="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"
          ></div>
          <p class="text-slate-500 font-medium animate-pulse">Chargement des données client...</p>
        </ng-template>
      </div>
    </ng-template>
  `,
  styles: [],
})
export class ClientDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private fb = inject(FormBuilder);

  client = signal<Client | null>(null);
  errorMessage = signal<string | null>(null);

  isEditing = false;
  isUpdating = false;
  editForm!: FormGroup;

  constructor() {
    this.editForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadData(parseInt(idParam));
    } else {
      this.errorMessage.set("ID du client manquant dans l'URL");
    }
  }

  loadData(id: number) {
    forkJoin({
      client: this.bankService.getClientById(id).pipe(
        catchError((err) => {
          console.error('Error fetching client', err);
          throw err;
        }),
      ),
      accounts: this.bankService.getAccountsByClient(id).pipe(
        catchError((err) => {
          console.warn('Error fetching accounts, continuing with empty list', err);
          return of([] as Account[]);
        }),
      ),
    })
      .pipe(
        map((result) => {
          const fullClient = { ...result.client };
          fullClient.accounts =
            result.client.accounts && result.client.accounts.length > 0
              ? result.client.accounts
              : result.accounts;
          return fullClient;
        }),
        catchError((err) => {
          this.errorMessage.set(
            "Impossible de trouver le client demandé. Vérifiez si l'identifiant est correct.",
          );
          this.ns.showError('Erreur lors du chargement des données');
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.client.set(data);
          this.editForm.patchValue({
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            address: data.address,
          });
        }
      });
  }

  onUpdateClient() {
    if (this.editForm.invalid || !this.client()?.id) return;

    this.isUpdating = true;
    const clientId = this.client()!.id!;

    this.bankService.updateClient(clientId, this.editForm.value)
      .pipe(finalize(() => (this.isUpdating = false)))
      .subscribe({
        next: (updated) => {
          this.ns.showSuccess('Informations client mises à jour');
          this.isEditing = false;
          this.loadData(clientId);
        },
        error: (err) => {
          this.ns.showError('Erreur lors de la mise à jour');
          console.error(err);
        }
      });
  }

  deleteClient() {
    const clientId = this.client()?.id;
    if (!clientId) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
      this.bankService.deleteClient(clientId).subscribe({
        next: () => {
          this.ns.showSuccess('Client supprimé avec succès');
          this.router.navigate(['/dashboard/admin/clients']);
        },
        error: (err) => {
          this.ns.showError('Erreur lors de la suppression');
          console.error(err);
        }
      });
    }
  }

  getTotalBalance(): number {
    const currentClient = this.client();
    if (!currentClient?.accounts) return 0;
    return currentClient.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }
}
