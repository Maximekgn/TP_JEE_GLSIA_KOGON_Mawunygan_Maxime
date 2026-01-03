import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Aide & Support</h2>
        <p class="text-slate-500">Besoin d'aide ? Notre équipe est à votre disposition.</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-4">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Appelez-nous</h3>
          <p class="text-sm text-slate-500 mt-2">Disponible 24h/24 et 7j/7 pour les urgences bancaires.</p>
          <p class="mt-4 font-bold text-red-600">+228 22 00 00 00</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 mb-4">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900">Écrivez-nous</h3>
          <p class="text-sm text-slate-500 mt-2">Envoyez-nous un email pour vos questions non-urgentes.</p>
          <p class="mt-4 font-bold text-red-600">support@ega-banking.tg</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
        <h3 class="text-xl font-bold text-slate-900 mb-6">Foire Aux Questions</h3>
        <div class="space-y-6">
          <div *ngFor="let faq of faqs" class="space-y-2">
            <h4 class="font-bold text-slate-800">{{ faq.q }}</h4>
            <p class="text-sm text-slate-600">{{ faq.a }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SupportComponent {
  faqs = [
    { q: 'Comment changer mon code secret ?', a: 'Vous pouvez changer votre code PIN directement depuis la section Profile ou via un distributeur automatique.' },
    { q: 'Quels sont les délais pour un virement ?', a: 'Les virements internes sont instantanés. Les virements externes vers d\'autres banques de la zone UEMOA prennent généralement 24h.' },
    { q: 'Comment faire opposition à ma carte ?', a: 'En cas de perte ou de vol, contactez immédiatement le service client au numéro vert +228 22 00 00 00.' },
  ];
}
