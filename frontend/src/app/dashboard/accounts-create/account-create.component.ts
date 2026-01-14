import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';

import { BankService, Client, Account } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';

type AccountCreateForm = {
  accountType: FormControl<string>;
  ownerId: FormControl<number | null>;
};

@Component({
  selector: 'app-account-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="goBack()"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Retour"
            >
              ←
            </button>
            <h2 class="text-2xl font-bold text-slate-800">Ouvrir un nouveau compte</h2>
          </div>
          <p class="text-sm text-slate-500">
            <ng-container *ngIf="client()">
              Pour le client :
              <span class="font-semibold text-slate-700">
                {{ client()?.first_name }} {{ client()?.last_name }}
              </span>
              ({{ client()?.email }})
            </ng-container>
            <ng-container *ngIf="!client()">
              Sélectionnez le client et le type de compte
            </ng-container>
          </p>
        </div>

        <div class="flex gap-2">
          <button
            type="button"
            (click)="resetForm()"
            class="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            [disabled]="submitting()"
          >
            Réinitialiser
          </button>

          <button
            type="button"
            (click)="submit()"
            class="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="submitting() || form.invalid"
          >
            <span *ngIf="!submitting()">Créer le compte</span>
            <span *ngIf="submitting()">Création en cours...</span>
          </button>
        </div>
      </div>

      <!-- Global error -->
      <div
        *ngIf="globalError()"
        class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl"
      >
        <div class="font-semibold">Erreur</div>
        <div class="text-sm mt-1">{{ globalError() }}</div>
      </div>

      <!-- Client Info Card -->
      <div *ngIf="client()" class="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
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
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div class="flex-1">
            <div class="text-sm opacity-90">Client sélectionné</div>
            <div class="text-xl font-bold">
              {{ client()?.first_name }} {{ client()?.last_name }}
            </div>
            <div class="text-sm opacity-75">{{ client()?.email }}</div>
          </div>
          <div class="text-right">
            <div class="text-sm opacity-90">Comptes existants</div>
            <div class="text-2xl font-bold">{{ client()?.accounts?.length || 0 }}</div>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-6"
        novalidate
      >
        <!-- Account Type Selection -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
            Type de compte
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- COURANT -->
            <label
              class="relative flex items-start p-6 bg-slate-50 rounded-xl border-2 cursor-pointer transition-all hover:bg-blue-50"
              [class.border-blue-600]="form.get('accountType')?.value === 'COURANT'"
              [class.bg-blue-50]="form.get('accountType')?.value === 'COURANT'"
              [class.border-slate-200]="form.get('accountType')?.value !== 'COURANT'"
            >
              <input
                type="radio"
                formControlName="accountType"
                value="COURANT"
                class="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <div class="ml-4 flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                    CR
                  </div>
                  <span class="text-lg font-bold text-slate-900">Compte Courant</span>
                </div>
                <p class="text-sm text-slate-600">
                  Compte pour les opérations quotidiennes : dépôts, retraits et transferts.
                </p>
              </div>
            </label>

            <!-- EPARGNE -->
            <label
              class="relative flex items-start p-6 bg-slate-50 rounded-xl border-2 cursor-pointer transition-all hover:bg-fuchsia-50"
              [class.border-fuchsia-600]="form.get('accountType')?.value === 'EPARGNE'"
              [class.bg-fuchsia-50]="form.get('accountType')?.value === 'EPARGNE'"
              [class.border-slate-200]="form.get('accountType')?.value !== 'EPARGNE'"
            >
              <input
                type="radio"
                formControlName="accountType"
                value="EPARGNE"
                class="mt-1 text-fuchsia-600 focus:ring-fuchsia-500"
              />
              <div class="ml-4 flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-10 h-10 bg-fuchsia-100 text-fuchsia-600 rounded-lg flex items-center justify-center font-bold">
                    EP
                  </div>
                  <span class="text-lg font-bold text-slate-900">Compte Épargne</span>
                </div>
                <p class="text-sm text-slate-600">
                  Compte dédié à l'épargne avec des conditions spéciales.
                </p>
              </div>
            </label>
          </div>

          <p *ngIf="isInvalid('accountType')" class="mt-2 text-sm text-red-600">
            {{ getControlError('accountType') }}
          </p>
        </div>

        <!-- Client Selection (only if no client pre-selected) -->
        <div *ngIf="!clientId()" class="space-y-4">
          <h3 class="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
            Sélectionner le client
          </h3>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Client propriétaire *
            </label>
            <select
              formControlName="ownerId"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              [class.border-red-300]="isInvalid('ownerId')"
            >
              <option [ngValue]="null">-- Sélectionner un client --</option>
              <option *ngFor="let c of allClients()" [ngValue]="c.id">
                {{ c.first_name }} {{ c.last_name }} - {{ c.email }}
              </option>
            </select>
            <p *ngIf="isInvalid('ownerId')" class="mt-1 text-xs text-red-600">
              {{ getControlError('ownerId') }}
            </p>
          </div>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div class="flex items-start gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5 text-blue-600 mt-0.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div class="flex-1 text-sm text-blue-700">
              <p class="font-semibold mb-1">Informations importantes</p>
              <ul class="space-y-1 text-xs">
                <li>• Le numéro de compte sera généré automatiquement au format IBAN togolais</li>
                <li>• Le solde initial sera de 0.00 FCFA</li>
                <li>• Un client peut avoir plusieurs comptes (COURANT et ÉPARGNE)</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Submit (mobile) -->
        <div class="pt-2 flex justify-end md:hidden">
          <button
            type="submit"
            class="w-full px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="submitting() || form.invalid"
          >
            <span *ngIf="!submitting()">Créer le compte</span>
            <span *ngIf="submitting()">Création en cours...</span>
          </button>
        </div>
      </form>

      <!-- Current Accounts (if client selected) -->
      <div *ngIf="client() && client()!.accounts && client()!.accounts!.length > 0" class="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <h3 class="text-sm font-bold text-slate-700 mb-4">Comptes existants du client</h3>
        <div class="space-y-3">
          <div
            *ngFor="let acc of client()?.accounts"
            class="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div
                [class]="
                  acc.accountType === 'COURANT'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-fuchsia-100 text-fuchsia-600'
                "
                class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs"
              >
                {{ acc.accountType === 'COURANT' ? 'CR' : 'EP' }}
              </div>
              <div>
                <div class="font-semibold text-slate-900">{{ acc.accountNumber }}</div>
                <div class="text-xs text-slate-500">{{ acc.accountType }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-slate-900">{{ acc.balance | number: '1.2-2' }} FCFA</div>
              <div class="text-xs text-slate-400">Solde</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class AccountCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitting = signal<boolean>(false);
  globalError = signal<string | null>(null);
  clientId = signal<number | null>(null);
  client = signal<Client | null>(null);
  allClients = signal<Client[]>([]);

  form: FormGroup<AccountCreateForm> = this.fb.group<AccountCreateForm>({
    accountType: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    ownerId: this.fb.control<number | null>(null, {
      validators: [Validators.required],
    }),
  });

  ngOnInit(): void {
    // Check if we have a clientId from query params
    const clientIdParam = this.route.snapshot.queryParamMap.get('clientId');

    if (clientIdParam) {
      const id = parseInt(clientIdParam);
      this.clientId.set(id);
      this.form.patchValue({ ownerId: id });
      this.loadClient(id);
    } else {
      // No client pre-selected, load all clients for selection
      this.loadAllClients();
    }
  }

  loadClient(id: number) {
    this.bankService
      .getClientById(id)
      .pipe(
        catchError((err) => {
          console.error('Error loading client', err);
          this.ns.showError('Erreur lors du chargement du client');
          return of(null);
        }),
      )
      .subscribe((client) => {
        if (client) {
          this.client.set(client);
        }
      });
  }

  loadAllClients() {
    this.bankService
      .getAllClients()
      .pipe(
        catchError((err) => {
          console.error('Error loading clients', err);
          this.ns.showError('Erreur lors du chargement des clients');
          return of([]);
        }),
      )
      .subscribe((clients) => {
        this.allClients.set(clients);
      });
  }

  resetForm() {
    const currentClientId = this.clientId();
    this.form.reset({
      accountType: '',
      ownerId: currentClientId,
    });
    this.globalError.set(null);
  }

  submit() {
    this.globalError.set(null);

    if (this.submitting()) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.ns.showError('Veuillez corriger les erreurs du formulaire.');
      return;
    }

    const v = this.form.getRawValue();

    if (!v.ownerId) {
      this.globalError.set('Veuillez sélectionner un client propriétaire.');
      return;
    }

    const payload = {
      accountType: v.accountType as 'COURANT' | 'EPARGNE',
      owner: {
        id: v.ownerId,
      },
    };

    this.submitting.set(true);

    this.bankService
      .createAccount(payload)
      .pipe(
        catchError((err: unknown) => {
          this.handleApiError(err);
          return of(null);
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe((created) => {
        if (!created) return;

        this.ns.showSuccess(
          `Compte ${created.accountType} créé avec succès ! Numéro : ${created.accountNumber}`,
        );

        // Navigate back to client details if we have a clientId, otherwise to accounts list
        if (this.clientId()) {
          this.router.navigate(['/dashboard/admin/clients', this.clientId()]);
        } else if (created.owner?.id) {
          this.router.navigate(['/dashboard/admin/clients', created.owner.id]);
        } else {
          this.router.navigateByUrl('/dashboard/admin/accounts');
        }
      });
  }

  goBack() {
    if (this.clientId()) {
      this.router.navigate(['/dashboard/admin/clients', this.clientId()]);
    } else {
      this.router.navigateByUrl('/dashboard/admin/clients');
    }
  }

  isInvalid(fieldName: keyof AccountCreateForm): boolean {
    const c = this.form.get(fieldName);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getControlError(fieldName: keyof AccountCreateForm): string {
    const c = this.form.get(fieldName);
    if (!c || !c.errors) return '';

    if (c.errors['required']) return 'Ce champ est obligatoire.';
    if (c.errors['api']) return c.errors['api'];

    return 'Valeur invalide.';
  }

  private handleApiError(err: unknown) {
    if (!(err instanceof HttpErrorResponse)) {
      this.globalError.set('Erreur réseau ou serveur inaccessible.');
      this.ns.showError('Erreur réseau ou serveur inaccessible.');
      return;
    }

    const status = err.status;

    // 404 Not Found => Client non trouvé
    if (status === 404) {
      const message = "Le client spécifié n'existe pas.";
      this.globalError.set(message);
      this.ns.showError(message);
      return;
    }

    // 400 Bad Request => validation error
    if (status === 400) {
      this.globalError.set('Données invalides. Vérifiez votre saisie.');
      this.ns.showError('Données invalides.');
      return;
    }

    // 401 Unauthorized
    if (status === 401) {
      const m = 'Non authentifié. Veuillez vous reconnecter.';
      this.globalError.set(m);
      this.ns.showError(m);
      return;
    }

    // Autre erreur
    this.globalError.set(`Erreur serveur (${status}). Contactez l'administrateur.`);
    this.ns.showError('Erreur lors de la création du compte.');
  }
}
