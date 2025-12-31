import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <h2 class="text-2xl font-bold mb-6">Effectuer un virement</h2>
      <p class="text-slate-500">Envoyez de l'argent vers un compte interne ou externe.</p>
    </div>
  `
})
export class TransferComponent {}
