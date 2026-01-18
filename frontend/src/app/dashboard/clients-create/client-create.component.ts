import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BankService } from '../../../security/core/services/bank.service';
import { NotificationService } from '../../../security/core/services/notification.service';
import { catchError, finalize, of } from 'rxjs';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-2">
        <button
          (click)="goBack()"
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          title="Retour"
        >
          ←
        </button>
        <h2 class="text-2xl font-bold text-slate-800">{{ isEditMode() ? 'Modifier Client' : 'Nouveau Client' }}</h2>
      </div>

      <div class="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-6">
          
          <!-- Personal Info -->
          <div class="space-y-4">
             <h3 class="text-sm font-bold text-slate-900 border-b pb-2 uppercase tracking-wide">Informations Personnelles</h3>
             
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                   <label class="text-xs font-bold text-slate-500 uppercase">Prénom *</label>
                   <input type="text" formControlName="first_name" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <p *ngIf="isInvalid('first_name')" class="text-xs text-red-500 mt-1">Requis</p>
                </div>
                <div class="space-y-1">
                   <label class="text-xs font-bold text-slate-500 uppercase">Nom *</label>
                   <input type="text" formControlName="last_name" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <p *ngIf="isInvalid('last_name')" class="text-xs text-red-500 mt-1">Requis</p>
                </div>
             </div>

             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                   <label class="text-xs font-bold text-slate-500 uppercase">Date de Naissance *</label>
                   <input type="date" formControlName="birthDate" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <p *ngIf="isInvalid('birthDate')" class="text-xs text-red-500 mt-1">Requis</p>
                </div>
                <div class="space-y-1">
                   <label class="text-xs font-bold text-slate-500 uppercase">Genre *</label>
                   <select formControlName="gender" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                      <option value="">Sélectionner</option>
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                   </select>
                   <p *ngIf="isInvalid('gender')" class="text-xs text-red-500 mt-1">Requis</p>
                </div>
             </div>

             <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase">Nationalité *</label>
                <input type="text" formControlName="nationality" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ex: Togolaise" />
                <p *ngIf="isInvalid('nationality')" class="text-xs text-red-500 mt-1">Requis</p>
             </div>
          </div>

          <!-- Contact Info -->
          <div class="space-y-4 pt-4">
             <h3 class="text-sm font-bold text-slate-900 border-b pb-2 uppercase tracking-wide">Contact</h3>
             
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1">
                   <label class="text-xs font-bold text-slate-500 uppercase">Email *</label>
                   <input type="email" formControlName="email" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <p *ngIf="isInvalid('email')" class="text-xs text-red-500 mt-1">Email invalide ou requis</p>
                </div>
                <div class="space-y-1">
                   <label class="text-xs font-bold text-slate-500 uppercase">Téléphone *</label>
                   <input type="tel" formControlName="phoneNumber" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                   <p *ngIf="isInvalid('phoneNumber')" class="text-xs text-red-500 mt-1">Requis</p>
                </div>
             </div>
             
             <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase">Adresse *</label>
                <textarea formControlName="address" rows="3" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                <p *ngIf="isInvalid('address')" class="text-xs text-red-500 mt-1">Requis</p>
             </div>
          </div>

          <div class="pt-6 flex justify-end gap-3">
             <button type="button" (click)="goBack()" class="px-6 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Annuler
             </button>
             <button type="submit" [disabled]="form.invalid || submitting()" class="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                <span *ngIf="submitting()" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                {{ isEditMode() ? 'Mettre à jour' : 'Créer le Client' }}
             </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private bankService = inject(BankService);
  private ns = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  submitting = signal(false);
  isEditMode = signal(false);
  clientId: number | null = null;

  form: FormGroup = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    birthDate: ['', Validators.required],
    gender: ['', Validators.required],
    nationality: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    address: ['', Validators.required]
  });

  ngOnInit() {
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
          this.isEditMode.set(true);
          this.clientId = +id;
          this.loadClient(this.clientId);
      }
  }

  loadClient(id: number) {
      this.bankService.getClientById(id).subscribe({
          next: (client) => {
              // Prefer snake_case from backend
              const birthDateVal = client.birth_date || client.birthDate;
              const phoneVal = client.phone_number || client.phoneNumber;

              this.form.patchValue({
                  first_name: client.first_name,
                  last_name: client.last_name,
                  birthDate: birthDateVal ? birthDateVal.split('T')[0] : '',
                  gender: client.gender,
                  nationality: client.nationality,
                  email: client.email,
                  phoneNumber: phoneVal,
                  address: client.address
              });
          },
          error: (err) => {
              this.ns.showError('Impossible de charger le client');
              this.goBack();
          }
      });
  }

  goBack() {
    this.router.navigate(['/dashboard/admin/clients']);
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    
    // Map form values to backend expected format (snake_case for @JsonProperty fields)
    const formVal = this.form.value;
    const payload = {
        ...formVal,
        birth_date: formVal.birthDate,    // Map birthDate -> birth_date
        phone_number: formVal.phoneNumber // Map phoneNumber -> phone_number
    };

    if (this.isEditMode() && this.clientId) {
        this.bankService.updateClient(this.clientId, payload)
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (client) => {
                    this.ns.showSuccess('Client mis à jour avec succès');
                    this.router.navigate(['/dashboard/admin/clients']);
                },
                error: (err) => {
                    console.error(err);
                    this.ns.showError("Erreur lors de la mise à jour");
                }
            });
    } else {
        this.bankService.createClient(payload)
            .pipe(finalize(() => this.submitting.set(false)))
            .subscribe({
                next: (client) => {
                    this.ns.showSuccess(`Client ${client.first_name} ${client.last_name} créé avec succès`);
                    this.router.navigate(['/dashboard/admin/clients', client.id]);
                },
                error: (err) => {
                    console.error(err);
                    this.ns.showError("Erreur lors de la création du client. Vérifiez l'email.");
                }
            });
    }
  }
}
