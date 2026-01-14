import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';

import { BankService } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';

type ApiValidationError = {
  error: 'ValidationError';
  errors?: Array<{ field: string; message: string }>;
};

type ApiConflictError = {
  error: 'Conflict';
  message?: string;
};

type ApiUnauthorizedError = {
  error: 'Unauthorized';
  message?: string;
};

type ApiServerError = {
  error: 'ServerError';
  message?: string;
};

type ApiErrorBody =
  | ApiValidationError
  | ApiConflictError
  | ApiUnauthorizedError
  | ApiServerError
  | any;

type ClientCreateForm = {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  birthDate: FormControl<string>;
  gender: FormControl<string>;
  address: FormControl<string>;
  nationality: FormControl<string>;
};

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <a
              routerLink="/dashboard/admin/clients"
              class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              title="Retour à la liste"
            >
              ←
            </a>
            <h2 class="text-2xl font-bold text-slate-800">Créer un client</h2>
          </div>
          <p class="text-sm text-slate-500">
            Renseigne les informations ci-dessous puis valide pour créer le client.
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
            <span *ngIf="!submitting()">Créer</span>
            <span *ngIf="submitting()">Création...</span>
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

      <!-- Form -->
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-6"
        novalidate
      >
        <!-- Informations personnelles -->
        <div class="space-y-4">
          <h3 class="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">
            Informations personnelles
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Prénom *
              </label>
              <input
                type="text"
                formControlName="firstName"
                autocomplete="given-name"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('firstName')"
                placeholder="Ex: Alice"
              />
              <p *ngIf="isInvalid('firstName')" class="mt-1 text-xs text-red-600">
                {{ getControlError('firstName') }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Nom *
              </label>
              <input
                type="text"
                formControlName="lastName"
                autocomplete="family-name"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('lastName')"
                placeholder="Ex: Dupont"
              />
              <p *ngIf="isInvalid('lastName')" class="mt-1 text-xs text-red-600">
                {{ getControlError('lastName') }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Email *
              </label>
              <input
                type="email"
                formControlName="email"
                autocomplete="email"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('email')"
                placeholder="ex: alice@example.com"
              />
              <p *ngIf="isInvalid('email')" class="mt-1 text-xs text-red-600">
                {{ getControlError('email') }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Téléphone *
              </label>
              <input
                type="tel"
                formControlName="phoneNumber"
                autocomplete="tel"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('phoneNumber')"
                placeholder="Ex: 123456789"
              />
              <p *ngIf="isInvalid('phoneNumber')" class="mt-1 text-xs text-red-600">
                {{ getControlError('phoneNumber') }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Date de naissance *
              </label>
              <input
                type="date"
                formControlName="birthDate"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('birthDate')"
              />
              <p *ngIf="isInvalid('birthDate')" class="mt-1 text-xs text-red-600">
                {{ getControlError('birthDate') }}
              </p>
              <p class="mt-1 text-xs text-slate-500">Format: YYYY-MM-DD</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Genre *
              </label>
              <select
                formControlName="gender"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('gender')"
              >
                <option value="">-- Sélectionner --</option>
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
              <p *ngIf="isInvalid('gender')" class="mt-1 text-xs text-red-600">
                {{ getControlError('gender') }}
              </p>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
                Nationalité *
              </label>
              <input
                type="text"
                formControlName="nationality"
                class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                [class.border-red-300]="isInvalid('nationality')"
                placeholder="Ex: TG, FR, US"
                maxlength="2"
              />
              <p *ngIf="isInvalid('nationality')" class="mt-1 text-xs text-red-600">
                {{ getControlError('nationality') }}
              </p>
              <p class="mt-1 text-xs text-slate-500">Code pays (2 lettres)</p>
            </div>
          </div>
        </div>

        <!-- Adresse -->
        <div class="border-t border-slate-100 pt-6 space-y-4">
          <h3 class="text-sm font-bold text-slate-700">Adresse *</h3>

          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">
              Adresse complète
            </label>
            <textarea
              rows="3"
              formControlName="address"
              class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              [class.border-red-300]="isInvalid('address')"
              placeholder="Ex: 1 Rue Principale, 75001 Paris, France"
            ></textarea>
            <p *ngIf="isInvalid('address')" class="mt-1 text-xs text-red-600">
              {{ getControlError('address') }}
            </p>
            <p class="mt-1 text-xs text-slate-500">
              Saisir l'adresse complète avec rue, code postal, ville et pays
            </p>
          </div>
        </div>

        <!-- Submit (mobile) -->
        <div class="pt-2 flex justify-end md:hidden">
          <button
            type="submit"
            class="w-full px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            [disabled]="submitting() || form.invalid"
          >
            <span *ngIf="!submitting()">Créer</span>
            <span *ngIf="submitting()">Création...</span>
          </button>
        </div>
      </form>

      <!-- Info -->
      <div class="text-xs text-slate-500 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="font-semibold text-blue-700 mb-2">ℹ️ Informations</p>
        <ul class="space-y-1 text-blue-600">
          <li>• Tous les champs marqués d'un astérisque (*) sont obligatoires</li>
          <li>• L'email doit être unique (pas de doublons)</li>
          <li>• Le format de date est YYYY-MM-DD (ex: 1990-01-01)</li>
          <li>• Le code pays doit être au format ISO (2 lettres: TG, FR, US, etc.)</li>
          <li>• Le genre doit être soit "M" (Masculin) soit "F" (Féminin)</li>
        </ul>
      </div>
    </div>
  `,
  styles: [],
})
export class ClientCreateComponent {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private router = inject(Router);

  submitting = signal<boolean>(false);
  globalError = signal<string | null>(null);

  form: FormGroup<ClientCreateForm> = this.fb.group<ClientCreateForm>({
    firstName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    lastName: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    email: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phoneNumber: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    birthDate: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    gender: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    address: this.fb.control('', { nonNullable: true, validators: [Validators.required] }),
    nationality: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(2)],
    }),
  });

  resetForm() {
    this.form.reset({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      birthDate: '',
      gender: '',
      address: '',
      nationality: '',
    });
    this.globalError.set(null);
    this.clearApiFieldErrors();
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

    // Construire le payload avec snake_case comme attendu par le backend
    const payload: any = {
      first_name: v.firstName.trim(),
      last_name: v.lastName.trim(),
      email: v.email.trim(),
      phoneNumber: v.phoneNumber.trim(),
      birthDate: v.birthDate.trim(),
      gender: v.gender.trim(),
      address: v.address.trim(),
      nationality: v.nationality.trim().toUpperCase(),
    };

    this.submitting.set(true);

    this.bankService
      .createClient(payload)
      .pipe(
        catchError((err: unknown) => {
          this.handleApiError(err);
          return of(null);
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe((created) => {
        if (!created) return;

        this.ns.showSuccess('Client créé avec succès.');
        this.router.navigateByUrl('/dashboard/admin/clients');
      });
  }

  isInvalid(fieldName: keyof ClientCreateForm): boolean {
    const c = this.form.get(fieldName);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getControlError(fieldName: keyof ClientCreateForm): string {
    const c = this.form.get(fieldName);
    if (!c || !c.errors) return '';

    if (c.errors['required']) return 'Ce champ est obligatoire.';
    if (c.errors['email']) return 'Email invalide.';
    if (c.errors['minlength']) return `Minimum ${c.errors['minlength'].requiredLength} caractères.`;
    if (c.errors['maxlength']) return `Maximum ${c.errors['maxlength'].requiredLength} caractères.`;
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
    const body = err.error as ApiErrorBody;

    // 409 Conflict => email déjà utilisé
    if (status === 409) {
      const message = 'Cet email est déjà utilisé par un autre client.';
      const emailCtrl = this.form.get('email');
      emailCtrl?.setErrors({ api: message });
      this.globalError.set(message);
      this.ns.showError(message);
      return;
    }

    // 400 Bad Request => validation error
    if (status === 400) {
      if (body && typeof body === 'object' && 'errors' in body && Array.isArray(body.errors)) {
        const errors = body.errors as Array<{ field: string; message: string }>;

        // Mapper les erreurs de champs
        for (const { field, message } of errors) {
          const mapped = this.mapApiFieldToFormControl(field);
          if (mapped) {
            const ctrl = this.form.get(mapped);
            ctrl?.setErrors({ api: message });
          }
        }

        this.globalError.set('Des erreurs de validation sont présentes. Vérifiez les champs.');
        this.ns.showError('Erreur de validation des données.');
      } else {
        this.globalError.set('Données invalides. Vérifiez votre saisie.');
        this.ns.showError('Données invalides.');
      }
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
    this.ns.showError('Erreur lors de la création du client.');
  }

  private clearApiFieldErrors() {
    const controls = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'birthDate',
      'gender',
      'address',
      'nationality',
    ] as const;

    for (const name of controls) {
      const ctrl = this.form.get(name);
      if (ctrl?.errors && ctrl.errors['api']) {
        const { api, ...rest } = ctrl.errors;
        ctrl.setErrors(Object.keys(rest).length ? rest : null);
      }
    }
  }

  private mapApiFieldToFormControl(apiField: string): keyof ClientCreateForm | null {
    // Mapping des noms de champs API (snake_case) vers les noms de contrôles du formulaire (camelCase)
    const mapping: Record<string, keyof ClientCreateForm> = {
      first_name: 'firstName',
      last_name: 'lastName',
      email: 'email',
      phoneNumber: 'phoneNumber',
      birthDate: 'birthDate',
      gender: 'gender',
      address: 'address',
      nationality: 'nationality',
    };

    return mapping[apiField] ?? null;
  }
}
