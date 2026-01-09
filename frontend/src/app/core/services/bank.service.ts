import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  gender?: string;
  birthDate?: string;
  nationality?: string;
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
  creationDate?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: Client;
}

/**
 * Minimal payload to reference a client by id when creating/updating an account.
 * Backend only needs the id.
 */
export interface OwnerRef {
  id: number;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

export interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  transactionType: TransactionType;
  description?: string;
  /**
   * Source account can be absent in some UI projections (or legacy responses),
   * so keep it optional to match templates that use `tx.sourceAccount?.*`.
   */
  sourceAccount?: Account;
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

  // ----------------------------
  // Clients CRUD (Admin)
  // ----------------------------

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_BASE}/clients`);
  }

  getClientById(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_BASE}/clients/${clientId}`);
  }

  createClient(
    clientData: Partial<Client> & {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
  ): Observable<Client> {
    return this.http.post<Client>(`${this.API_BASE}/clients`, clientData);
  }

  updateClient(clientId: number, clientData: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_BASE}/clients/${clientId}`, clientData);
  }

  deleteClient(clientId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/clients/${clientId}`);
  }

  // ----------------------------
  // Accounts CRUD (Admin)
  // ----------------------------

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/accounts`);
  }

  getAccountById(accountId: number): Observable<Account> {
    return this.http.get<Account>(`${this.API_BASE}/accounts/${accountId}`);
  }

  createAccount(accountData: {
    owner: OwnerRef;
    accountType: 'SAVINGS' | 'CHECKING';
    accountNumber?: string;
    creationDate?: string;
    balance?: number;
  }): Observable<Account> {
    return this.http.post<Account>(`${this.API_BASE}/accounts`, accountData);
  }

  updateAccount(
    accountId: number,
    accountData: Partial<Account> & { owner?: OwnerRef | Client },
  ): Observable<Account> {
    return this.http.put<Account>(`${this.API_BASE}/accounts/${accountId}`, accountData);
  }

  deleteAccount(accountId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/accounts/${accountId}`);
  }

  getAccountsByClient(clientId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/accounts/client/${clientId}`);
  }

  // ----------------------------
  // Transactions
  // ----------------------------

  /**
   * Generic transaction creation (legacy). Prefer deposit/withdraw/transfer.
   */
  createTransaction(payload: {
    amount: number;
    transactionType: TransactionType;
    description?: string;
    transactionDate?: string;
    sourceAccount: { id: number };
    destinationAccount?: { id?: number; accountNumber?: string } | null;
  }): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions`, payload);
  }

  deposit(payload: {
    amount: number;
    description?: string;
    transactionDate?: string;
    sourceAccount: { id: number };
  }): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions/deposit`, payload);
  }

  withdraw(payload: {
    amount: number;
    description?: string;
    transactionDate?: string;
    sourceAccount: { id: number };
  }): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions/withdraw`, payload);
  }

  transfer(payload: {
    amount: number;
    description?: string;
    transactionDate?: string;
    sourceAccount: { id: number };
    destinationAccount: { id?: number; accountNumber?: string };
  }): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions/transfer`, payload);
  }

  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_BASE}/transactions`);
  }

  getTransactionById(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API_BASE}/transactions/${transactionId}`);
  }

  deleteTransaction(transactionId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/transactions/${transactionId}`);
  }

  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_BASE}/transactions/account/${accountId}`);
  }

  /**
   * Fetch transactions for an account over a date period.
   * Dates must be ISO-8601 strings parseable by LocalDateTime.parse on backend, e.g. "2026-01-09T00:00:00".
   */
  getTransactionsByAccountDateRange(
    accountId: number,
    startDateIso: string,
    endDateIso: string,
  ): Observable<Transaction[]> {
    const params = new HttpParams().set('startDate', startDateIso).set('endDate', endDateIso);

    return this.http.get<Transaction[]>(
      `${this.API_BASE}/transactions/account/${accountId}/date-range`,
      { params },
    );
  }

  /**
   * Get printable statement for an account over a date period.
   * Backend returns plain text.
   */
  getAccountStatement(
    accountId: number,
    startDateIso: string,
    endDateIso: string,
  ): Observable<string> {
    const params = new HttpParams().set('startDate', startDateIso).set('endDate', endDateIso);

    return this.http.get(`${this.API_BASE}/transactions/account/${accountId}/statement`, {
      params,
      responseType: 'text',
    });
  }
}
