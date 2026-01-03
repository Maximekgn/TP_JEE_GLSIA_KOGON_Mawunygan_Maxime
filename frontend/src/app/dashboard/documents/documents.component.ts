import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-slate-900">Mes Documents</h2>
        <p class="text-slate-500">Accédez à vos relevés de compte et documents officiels.</p>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div *ngFor="let doc of documents" class="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div class="flex items-center gap-4 mb-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h4 class="font-bold text-slate-900">{{ doc.name }}</h4>
              <p class="text-xs text-slate-400">{{ doc.date | date:'MMMM yyyy' }} • {{ doc.size }}</p>
            </div>
          </div>
          <button class="w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-slate-50 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger
          </button>
        </div>
      </div>
    </div>
  `
})
export class DocumentsComponent {
  documents = [
    { name: 'Relevé de compte', date: new Date(2025, 11), size: '156 KB' },
    { name: 'Relevé de compte', date: new Date(2025, 10), size: '142 KB' },
    { name: 'RIB / IBAN', date: new Date(2025, 0), size: '45 KB' },
    { name: 'Attestation de solde', date: new Date(2025, 11), size: '89 KB' },
  ];
}
