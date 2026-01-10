import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BankService, Account, Client } from '../../core/services/bank.service';
import { finalize, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-my-accounts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <header class="space-y-2">
        <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, Jean</h1>
        <p class="text-slate-500">Voici un aperçu de vos comptes et solde actuel.</p>
      </header>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        *ngIf="accounts$ | async as accounts"
      >
        <!-- Account Card -->
        <div
          *ngFor="let acc of accounts"
          class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
          <div class="flex justify-between items-start mb-8">
            <div
              class="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-8 h-8"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75m0 5.25v.75m0 5.25v.75m15-12.75V4.5m0 5.25v.75m0 5.25v.75m-15 0h.008v.008H3.75V16.5zm15 0h.008v.008h-.008V16.5zm-15-5.25h.008v.008H3.75v-.008zm15 0h.008v.008h-.008v-.008zm-15-5.25h.008v.008H3.75V6zm15 0h.008v.008h-.008V6zm-12.25 0h11.5c.663 0 1.25.537 1.25 1.25v11.5c0 .663-.537 1.25-1.25 1.25h-11.5c-.663 0-1.25-.537-1.25-1.25V7.25c0-.663.537-1.25 1.25-1.25z"
                />
              </svg>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500"
            >
              {{ acc.accountType }}
            </span>
          </div>

          <div>
            <p class="text-sm font-semibold text-slate-400 mb-1">Solde Disponible</p>
            <h3 class="text-3xl font-bold text-slate-900">
              {{ acc.balance | number : '1.2-2' }} <span class="text-lg text-slate-400">FCFA</span>
            </h3>
            <p class="text-xs text-slate-400 mt-4">{{ acc.accountNumber }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class MyAccountsComponent implements OnInit {
  private bankService = inject(BankService);
  accounts$: Observable<Account[]> = of([]);

  // Hardcoded Client ID for Demo (Jean Dupont = 1)
  private readonly CLIENT_ID = 1;

  ngOnInit(): void {
    // This calls the new interceptor logic for /api/accounts/client/1
    this.accounts$ = this.bankService.getAccountsByClient(this.CLIENT_ID).pipe(
      catchError((err) => {
        console.error(err);
        return of([]);
      })
    );
  }
}
