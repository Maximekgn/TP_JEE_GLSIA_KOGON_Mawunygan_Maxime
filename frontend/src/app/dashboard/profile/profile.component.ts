import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold mb-6">Mon Profil</h2>
      <p class="text-slate-500">Gérez vos informations personnelles et votre sécurité.</p>
    </div>
  `
})
export class ProfileComponent {}
