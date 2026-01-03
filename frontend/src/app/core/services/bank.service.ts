import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  gender: string;
  birthDate: string;
  nationality: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  accounts?: Account[];
}

export interface Account {
  id: number;
  accountNumber: string;
  accountType: 'SAVINGS' | 'CHECKING';
  balance: number;
  creationDate: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: Client;
}

export interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  transactionType: 'CREDIT' | 'DEBIT' | 'TRANSFER';
  description: string;
  sourceAccount: Account;
  destinationAccount?: Account | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BankService {
  private readonly API_BASE = '/api';

  constructor(private http: HttpClient) {}

  // --- Admin Methods ---

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_BASE}/clients`);
  }

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/accounts`);
  }

  // --- User Methods ---

  getAccountsByClient(clientId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/accounts/client/${clientId}`);
  }

  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_BASE}/transactions/account/${accountId}`);
  }

  getClientProfile(clientId: number): Observable<any> {
    return this.http.get<any>(`${this.API_BASE}/clients/${clientId}`);
  }

  updateClientProfile(clientId: number, clientData: any): Observable<any> {
    return this.http.put<any>(`${this.API_BASE}/clients/${clientId}`, clientData);
  }

  createTransaction(transaction: any): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions`, transaction);
  }

  createAccount(accountData: any): Observable<Account> {
    return this.http.post<Account>(`${this.API_BASE}/accounts`, accountData);
  }
}
