import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroShieldCheck, heroCheckCircle } from '@ng-icons/heroicons/outline';
import { ClientAuthService, ClientInfo } from '../../../security/core/services/client-auth.service';
import { transition, trigger, style, animate } from '@angular/animations';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  viewProviders: [
    provideIcons({ heroShieldCheck, heroCheckCircle })
  ],
  template: `
    <div class="max-w-4xl mx-auto py-8 px-4" [@fadeInUp]>
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">Mon Profil</h1>
        <p class="text-slate-500">Gérez vos informations personnelles et restez à jour.</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar: User Info -->
        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div class="relative mb-6">
              <img
                [src]="getAvatarUrl()"
                [alt]="fullName"
                class="w-32 h-32 rounded-full border-4 border-blue-50 shadow-lg"
              />
              <div class="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
            <h2 class="text-xl font-bold text-slate-900">{{ fullName }}</h2>
            <p class="text-slate-500 text-sm mb-4">{{ clientInfo?.email }}</p>
            <span class="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase tracking-wider">
              Client Vérifié
            </span>
          </div>

          <div class="bg-indigo-600 rounded-3xl p-8 text-white shadow-lg shadow-indigo-200">
            <h3 class="font-bold mb-4 flex items-center gap-2">
              <ng-icon name="heroShieldCheck" size="1.25rem"></ng-icon>
              Sécurité du compte
            </h3>
            <p class="text-indigo-100 text-sm mb-6">Votre compte est protégé par une authentification forte et un chiffrement de bout en bout.</p>
            <div class="space-y-4">
               <div class="p-4 bg-white/10 rounded-2xl border border-white/20">
                  <p class="text-xs font-medium text-indigo-100 mb-1">Dernière connexion</p>
                  <p class="text-sm font-bold">{{ today | date:'short' }}</p>
               </div>
            </div>
          </div>
        </div>

        <!-- Main: Form -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Information Personnelles (Lecture seule) -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden opacity-80">
            <div class="p-8 border-b border-slate-50 flex items-center justify-between">
              <div>
                <h3 class="text-lg font-bold text-slate-900">Informations Personnelles</h3>
                <p class="text-slate-500 text-sm">Contactez l'administrateur pour modifier ces données.</p>
              </div>
              <span class="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">Lecture seule</span>
            </div>

            <div class="p-8">
              <form [formGroup]="profileForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- First Name -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Prénom</label>
                    <input type="text" formControlName="first_name" readonly class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600" />
                  </div>

                  <!-- Last Name -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nom</label>
                    <input type="text" formControlName="last_name" readonly class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600" />
                  </div>

                  <!-- Gender -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Genre</label>
                    <input type="text" [value]="profileForm.get('gender')?.value === 'M' ? 'Masculin' : 'Féminin'" readonly class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600" />
                  </div>

                   <!-- Nationality -->
                   <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nationalité</label>
                    <input type="text" formControlName="nationality" readonly class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600" />
                  </div>

                  <!-- Phone -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Téléphone</label>
                    <input type="tel" formControlName="phone_number" readonly class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600" />
                  </div>

                  <!-- Birth Date -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date de naissance</label>
                    <input type="text" [value]="profileForm.get('birth_date')?.value | date:'longDate'" readonly class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600" />
                  </div>
                </div>

                <!-- Address -->
                <div class="space-y-2">
                  <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Adresse</label>
                  <textarea formControlName="address" readonly rows="2" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-medium text-slate-600 resize-none"></textarea>
                </div>
              </form>
            </div>
          </div>

          <!-- Changement de Mot de Passe -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-8 border-b border-slate-50">
              <h3 class="text-lg font-bold text-slate-900">Sécurité</h3>
              <p class="text-slate-500 text-sm">Mettez à jour votre mot de passe pour sécuriser votre compte.</p>
            </div>

            <div class="p-8">
              <div *ngIf="message" [class]="messageType === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'" class="p-4 rounded-2xl mb-6 text-sm flex items-center gap-3 animate-slide-in">
                <ng-icon *ngIf="messageType === 'success'" name="heroCheckCircle" size="1.25rem"></ng-icon>
                {{ message }}
              </div>

              <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()" class="space-y-6">
                <div class="space-y-4">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Mot de passe actuel</label>
                    <input type="password" formControlName="currentPassword" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-medium" />
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nouveau mot de passe</label>
                      <input type="password" formControlName="newPassword" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-medium" />
                    </div>
                    <div class="space-y-2">
                      <label class="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmer le mot de passe</label>
                      <input type="password" formControlName="confirmPassword" class="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all outline-none font-medium" />
                    </div>
                  </div>
                </div>

                <div class="flex pt-4">
                  <button
                    type="submit"
                    [disabled]="isLoading || passwordForm.invalid"
                    class="flex-1 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    {{ isLoading ? 'Mise à jour...' : 'Changer le mot de passe' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .animate-slide-in {
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
  ],
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private clientAuthService = inject(ClientAuthService);

  clientInfo: ClientInfo | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditing = false;
  isLoading = false;
  message = '';
  messageType: 'success' | 'error' = 'success';
  today = new Date();

  constructor() {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      phone_number: [''],
      address: [''],
      gender: [''],
      nationality: [''],
      birth_date: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(4)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadProfile();
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile() {
    this.clientAuthService.getCurrentClient().subscribe({
      next: (data) => {
        this.clientInfo = data;
        this.profileForm.patchValue({
          first_name: data.first_name,
          last_name: data.last_name,
          phone_number: data.phone_number,
          address: data.address,
          gender: data.gender,
          nationality: data.nationality,
          birth_date: data.birth_date,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.showMessage(err.message || 'Erreur lors du chargement du profil', 'error');
      },
    });
  }

  get fullName(): string {
    if (!this.clientInfo) return 'Client';
    return `${this.clientInfo.first_name} ${this.clientInfo.last_name}`;
  }

  getAvatarUrl(): string {
    const name = encodeURIComponent(this.fullName);
    return `https://ui-avatars.com/api/?name=${name}&background=6366f1&color=fff&size=128`;
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) return;

    this.isLoading = true;
    this.message = '';
    this.cdr.detectChanges();

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.clientAuthService.changePassword({ currentPassword, newPassword })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.showMessage('Mot de passe mis à jour avec succès', 'success');
          this.passwordForm.reset();
        },
        error: (err) => {
          this.showMessage(err.message || 'Erreur lors du changement de mot de passe', 'error');
        }
      });
  }

  private showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    this.cdr.detectChanges();
    
    if (type === 'success') {
      setTimeout(() => {
        this.message = '';
        this.cdr.detectChanges();
      }, 5000);
    }
  }
}
