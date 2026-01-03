import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankService } from '../../core/services/bank.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface ClientProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  nationality: string;
  birthDate: string;
  gender: string;
  address: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Mon Profil</h2>
        <p class="text-slate-500">Gérez vos informations personnelles et vos préférences de sécurité.</p>
      </div>

      <div class="grid gap-8 md:grid-cols-3" *ngIf="!loading && client; else loadingState">
        <!-- Sidebar with avatar -->
        <div class="md:col-span-1 space-y-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
            <div class="relative mx-auto w-32 h-32 mb-4">
              <div class="w-full h-full rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-4xl border-4 border-white shadow-lg">
                {{ client.firstName.charAt(0) }}{{ client.lastName.charAt(0) }}
              </div>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ client.firstName }} {{ client.lastName }}</h3>
            <p class="text-sm text-slate-500">{{ client.email }}</p>
            <p class="mt-2 text-xs text-slate-400">Membre depuis {{ client.createdAt | date:'dd/MM/yyyy' }}</p>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h4 class="font-bold text-slate-900 mb-4">Statut du compte</h4>
            <div class="flex items-center gap-3 p-3 rounded-xl" [ngClass]="client.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
              <div class="h-2 w-2 rounded-full" [ngClass]="client.isActive ? 'bg-green-500' : 'bg-red-500'"></div>
              {{ client.isActive ? 'Vérifié & Actif' : 'Inactif' }}
            </div>
          </div>
        </div>

        <!-- Main form -->
        <div class="md:col-span-2 space-y-6">
          <form (ngSubmit)="saveProfile()" #profileForm="ngForm" class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <h4 class="text-lg font-bold text-slate-900 mb-6 font-primary">Informations Personnelles</h4>
            
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-600">Prénom</label>
                <input type="text" [(ngModel)]="editClient.firstName" name="firstName" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-600">Nom</label>
                <input type="text" [(ngModel)]="editClient.lastName" name="lastName" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500" />
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-semibold text-slate-600">Email (Lecture seule)</label>
                <input type="email" [value]="client.email" readonly class="w-full rounded-xl border border-slate-100 bg-slate-50 p-3 text-slate-500 cursor-not-allowed" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-600">Téléphone</label>
                <input type="text" [(ngModel)]="editClient.phoneNumber" name="phoneNumber" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-600">Nationalité</label>
                <input type="text" [(ngModel)]="editClient.nationality" name="nationality" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-600">Date de naissance</label>
                <input type="date" [(ngModel)]="editClient.birthDate" name="birthDate" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500" />
              </div>
              <div class="space-y-2">
                <label class="text-sm font-semibold text-slate-600">Genre</label>
                <select [(ngModel)]="editClient.gender" name="gender" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500">
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="O">Autre</option>
                </select>
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="text-sm font-semibold text-slate-600">Adresse</label>
                <textarea [(ngModel)]="editClient.address" name="address" rows="2" class="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-red-500"></textarea>
              </div>
            </div>

            <div class="mt-8 pt-6 border-t border-slate-100">
              <button type="submit" [disabled]="saving" class="w-full md:w-auto px-8 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                {{ saving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
              </button>
            </div>
          </form>

          <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
            <h4 class="text-lg font-bold text-slate-900 mb-2 text-red-600">Zone de Danger</h4>
            <p class="text-sm text-slate-500 mb-6">La suppression de votre compte est irréversible.</p>
            <button class="px-6 py-2 border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors">
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>

      <ng-template #loadingState>
        <div class="flex h-64 items-center justify-center">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
        </div>
      </ng-template>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private bankService = inject(BankService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  client: ClientProfile | null = null;
  editClient: ClientProfile = {} as ClientProfile;
  loading = true;
  saving = false;

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.fetchProfile(userId);
    } else {
      this.loading = false;
    }
  }

  fetchProfile(userId: number): void {
    this.loading = true;
    this.bankService.getClientProfile(userId).subscribe({
      next: (data: ClientProfile) => {
        this.client = data;
        this.editClient = { ...data };
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching profile', err);
        this.notificationService.error('Impossible de charger le profil');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveProfile(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.saving = true;
    this.cdr.detectChanges();

    this.bankService.updateClientProfile(userId, this.editClient).subscribe({
      next: (updated: ClientProfile) => {
        this.client = updated;
        this.saving = false;
        this.notificationService.success('Profil mis à jour avec succès !');
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error updating profile', err);
        this.saving = false;
        this.notificationService.error('Erreur lors de la mise à jour du profil.');
        this.cdr.detectChanges();
      }
    });
  }
}
