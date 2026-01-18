import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id?: number;
  first_name: string;
  last_name: string;
  // Aliases for UI compatibility if needed, though backend uses snake_case
  firstName?: string;
  lastName?: string;
  email: string;
  birthDate: string;
  gender: string;
  address: string;
  phoneNumber: string;
  nationality: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  accounts?: Account[];
}

export interface Account {
  id?: number;
  accountNumber?: string;
  accountType: 'COURANT' | 'EPARGNE' | 'ENTREPRISE';
  balance: number;
  owner?: Client;
  creationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';

export interface Transaction {
  id: number;
  amount: number;
  transactionDate: string;
  transactionType: TransactionType;
  description?: string;
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
  // Clients CRUD
  // ----------------------------

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.API_BASE}/clients`);
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_BASE}/clients/${id}`);
  }

  getClientByEmail(email: string): Observable<Client> {
    return this.http.get<Client>(`${this.API_BASE}/clients/email/${email}`);
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.API_BASE}/clients`, client);
  }

  updateClient(id: number, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_BASE}/clients/${id}`, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/clients/${id}`);
  }

  // ----------------------------
  // Accounts CRUD
  // ----------------------------

  getAllAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/accounts`);
  }

  getAccountById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.API_BASE}/accounts/${id}`);
  }

  createAccount(account: {
    owner: { id: number };
    accountType: 'COURANT' | 'EPARGNE';
    accountNumber?: string;
  }): Observable<Account> {
    return this.http.post<Account>(`${this.API_BASE}/accounts`, account);
  }

  updateAccount(id: number, account: Partial<Account>): Observable<Account> {
    return this.http.put<Account>(`${this.API_BASE}/accounts/${id}`, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_BASE}/accounts/${id}`);
  }

  getAccountsByClient(clientId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/accounts/client/${clientId}`);
  }

  // ----------------------------
  // Transactions
  // ----------------------------

  /**
   * Deposit money into an account
   *
   * Note: return the full HttpResponse so callers can inspect status/headers.
   */
  deposit(payload: {
    sourceAccount: { id: number };
    amount: number;
    description: string;
  }): Observable<HttpResponse<Transaction>> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions/deposit`, payload, {
      observe: 'response',
    });
  }

  /**
   * Withdraw money from an account
   *
   * Note: return the full HttpResponse so callers can inspect status/headers.
   */
  withdraw(payload: {
    sourceAccount: { id: number };
    amount: number;
    description: string;
  }): Observable<HttpResponse<Transaction>> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions/withdraw`, payload, {
      observe: 'response',
    });
  }

  /**
   * Transfer money between accounts
   *
   * Note: return the full HttpResponse so callers can inspect status/headers.
   */
  transfer(payload: {
    sourceAccount: { id: number };
    destinationAccount: { id: number } | { accountNumber: string };
    amount: number;
    description: string;
  }): Observable<HttpResponse<Transaction>> {
    return this.http.post<Transaction>(`${this.API_BASE}/transactions/transfer`, payload, {
      observe: 'response',
    });
  }

  /**
   * Secure transfer for client role
   */
  clientTransfer(accountId: number, payload: {
    destination_account_id?: number | null;
    destination_account_number?: string | null;
    amount: number;
    description: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.API_BASE}/client/accounts/${accountId}/transfer`, payload);
  }

  /**
   * List all transactions in the system
   */
  getAllTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_BASE}/transactions`);
  }

  /**
   * List all transactions for a specific account
   */
  getTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_BASE}/transactions/account/${accountId}`);
  }

  /**
   * Get printable statement for an account over a date period.
   * Dates must be ISO LocalDateTime (YYYY-MM-DDTHH:MM:SS)
   */
  getAccountStatement(accountId: number, startDate: string, endDate: string): Observable<string> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);

    return this.http.get(`${this.API_BASE}/transactions/account/${accountId}/statement`, {
      params,
      responseType: 'text',
    });
  }

  /**
   * Optional: List transactions with date range filtering (returns JSON array)
   * if supported by your backend beyond just the statement string.
   */
  getTransactionsByAccountDateRange(
    accountId: number,
    startDate: string,
    endDate: string,
  ): Observable<Transaction[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);

    return this.http.get<Transaction[]>(
      `${this.API_BASE}/transactions/account/${accountId}/date-range`,
      { params },
    );
  }

  // ----------------------------
  // Client-Specific Operations (using /api/client)
  // ----------------------------

  getMyAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_BASE}/client/accounts`);
  }

  getMyTransactionsByAccount(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.API_BASE}/client/accounts/${accountId}/transactions`);
  }

  getMyAccountStatement(accountId: number, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.API_BASE}/client/accounts/${accountId}/statement`, { params });
  }

  getMyAllTransactions(startDate?: string, endDate?: string): Observable<Transaction[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<Transaction[]>(`${this.API_BASE}/client/transactions`, { params });
  }

  getMyTransactionDetails(transactionId: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.API_BASE}/client/transactions/${transactionId}`);
  }
}
