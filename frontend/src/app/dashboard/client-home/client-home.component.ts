import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BankService, Account, Transaction } from '../../core/services/bank.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-home.component.html',
  styleUrls: []
})
export class ClientHomeComponent implements OnInit {
  accounts: Account[] = [];
  clientName: string = 'Client';
  lastTransaction: Transaction | null = null;
  loading = true;

  constructor(
    private bankService: BankService,
    public authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    const userType = this.authService.getUserType();
    
    console.log('Dashboard Init - User ID:', userId, 'User Type:', userType);
    
    if (userType === 'ADMIN') {
      this.clientName = 'Administrateur';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    if (userId) {
      this.fetchClientProfile(userId);
      this.fetchAccounts(userId);
    } else {
      this.loading = false;
    }
  }

  fetchClientProfile(userId: number): void {
    this.bankService.getClientProfile(userId).subscribe({
      next: (client) => {
        console.log('Client profile response:', client);
        if (client) {
          this.clientName = `${client.firstName} ${client.lastName}`;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error fetching client profile', err);
      }
    });
  }

  fetchAccounts(userId: number): void {
    this.loading = true;
    this.bankService.getAccountsByClient(userId).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (accounts: Account[]) => {
        console.log('Accounts response:', accounts);
        this.accounts = accounts || [];
        if (this.accounts.length > 0) {
          this.fetchLastTransaction(this.accounts[0].id);
        }
      },
      error: (err: any) => {
        console.error('Error fetching accounts', err);
      }
    });
  }

  fetchLastTransaction(accountId: number): void {
    this.bankService.getTransactionsByAccount(accountId).subscribe({
      next: (transactions: Transaction[]) => {
        console.log(`Transactions for account ${accountId}:`, transactions);
        if (transactions && transactions.length > 0) {
          // Sort safe
          this.lastTransaction = [...transactions].sort((a, b) => {
            const dateA = a.transactionDate ? new Date(a.transactionDate).getTime() : 0;
            const dateB = b.transactionDate ? new Date(b.transactionDate).getTime() : 0;
            return dateB - dateA;
          })[0];
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error fetching transactions', err);
      }
    });
  }

  get totalBalance() {
    return this.accounts.reduce((acc, curr) => acc + (curr.balance || 0), 0);
  }
}
