import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-home.component.html',
  styleUrls: []
})
export class ClientHomeComponent {
  accounts = [
    { type: 'Compte Courant', iban: 'FR76 ... 4321', balance: 2543.50, trend: '+150.00' },
    { type: 'Livret A', iban: 'FR76 ... 9876', balance: 12050.00, trend: '+50.00' },
    { type: 'Compte Épargne Logement', iban: 'FR76 ... 1122', balance: 5000.00, trend: '+0.00' }
  ];

  get totalBalance() {
    return this.accounts.reduce((acc, curr) => acc + curr.balance, 0);
  }

  // Mock last transaction
  lastTransaction = {
    date: '31/12/2024',
    label: 'Virement reçu - Salaire',
    amount: 2800.00,
    type: 'credit',
    account: 'Compte Courant'
  };
}
