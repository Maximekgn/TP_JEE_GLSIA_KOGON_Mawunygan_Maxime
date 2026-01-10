import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Account, Client, Transaction } from '../services/bank.service';

// --- INITIAL MOCK DATA ---

// Load from LocalStorage or Default
const STORAGE_KEY_CLIENTS = 'mock_clients';
const STORAGE_KEY_ACCOUNTS = 'mock_accounts';
const STORAGE_KEY_TRANSACTIONS = 'mock_transactions';

let clients: Client[] = JSON.parse(localStorage.getItem(STORAGE_KEY_CLIENTS) || 'null') || [
  {
    id: 1,
    email: 'jean.dupont@test.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    phoneNumber: '0102030405',
    address: '123 Rue de la Paix',
    active: true,
  },
  {
    id: 2,
    email: 'marie.curie@test.com',
    firstName: 'Marie',
    lastName: 'Curie',
    phoneNumber: '0607080910',
    address: '456 Avenue de la Science',
    active: true,
  },
];

let accounts: Account[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || 'null') || [
  {
    id: 101,
    accountNumber: 'ACC-1001',
    accountType: 'CHECKING',
    balance: 50000,
    owner: clients[0],
    createdAt: '2025-01-01T10:00:00',
  },
  {
    id: 102,
    accountNumber: 'ACC-1002',
    accountType: 'SAVINGS',
    balance: 150000,
    owner: clients[0],
    createdAt: '2025-01-02T11:00:00',
  },
  {
    id: 201,
    accountNumber: 'ACC-2001',
    accountType: 'CHECKING',
    balance: 75000,
    owner: clients[1],
    createdAt: '2025-01-03T12:00:00',
  },
];

let transactions: Transaction[] =
  JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSACTIONS) || 'null') || [];

// --- SEED DATA HELPER ---
if (transactions.length === 0) {
  const account1 = accounts[0]; // Jean Dupont Checking
  const account2 = accounts[1]; // Jean Dupont Savings

  // Generate 25 random transactions
  for (let i = 0; i < 25; i++) {
    const isDeposit = Math.random() > 0.5;
    const isTransfer = !isDeposit && Math.random() > 0.5;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Past 60 days

    if (isDeposit) {
      transactions.push({
        id: 1000 + i,
        transactionType: 'DEPOSIT',
        amount: Math.floor(Math.random() * 50000) + 1000,
        description: 'Virement reçu / Dépôt',
        transactionDate: date.toISOString(),
        destinationAccount: account1,
      });
    } else if (isTransfer) {
      transactions.push({
        id: 1000 + i,
        transactionType: 'TRANSFER',
        amount: Math.floor(Math.random() * 20000) + 1000,
        description: 'Virement vers Épargne',
        transactionDate: date.toISOString(),
        sourceAccount: account1,
        destinationAccount: account2,
      });
    } else {
      transactions.push({
        id: 1000 + i,
        transactionType: 'WITHDRAWAL',
        amount: Math.floor(Math.random() * 10000) + 500,
        description: 'Paiement Carte / Retrait',
        transactionDate: date.toISOString(),
        sourceAccount: account1,
      });
    }
  }
  // Sort by date desc
  transactions.sort(
    (a, b) => new Date(b.transactionDate!).getTime() - new Date(a.transactionDate!).getTime()
  );
  saveState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY_CLIENTS, JSON.stringify(clients));
  localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  // Only intercept /api requests
  if (!req.url.includes('/api')) {
    return next(req);
  }

  console.log(`[MockBackend] ${req.method} ${req.url}`, req.body || '');

  // Simulate network delay
  const delayMs = 500;

  // --- HANDLERS ---

  // GET /api/accounts (Get all accounts with owners)
  if (req.method === 'GET' && req.url.endsWith('/accounts')) {
    return of(new HttpResponse({ status: 200, body: accounts })).pipe(delay(delayMs));
  }

  // GET /api/accounts/client/:id (Get accounts for specific client)
  const clientAccountsMatch = req.url.match(/\/accounts\/client\/(\d+)$/);
  if (req.method === 'GET' && clientAccountsMatch) {
    const clientId = parseInt(clientAccountsMatch[1]);
    const clientAccounts = accounts.filter((a) => a.owner?.id === clientId);
    return of(new HttpResponse({ status: 200, body: clientAccounts })).pipe(delay(delayMs));
  }

  // GET /api/clients (Legacy path in service says 'accounts' for client calls? Checking logic...)
  // Service.getAllaccounts() -> /api/accounts returning Client[]?
  // Wait, let's look at BankService again.
  // getAllaccounts() returns Client[] but calls ${API_BASE}/accounts ??
  // Ah, the provided service code had `getAllaccounts(): Observable<Client[]>` pointing to `/accounts`.
  // And `getAllAccounts(): Observable<Account[]>` pointing to `/accounts`.
  // This is a conflict in the provided file or just bad naming.
  // Assuming frontend Service wants Accounts on /accounts.
  // Let's check `clients-list.component.ts` later to see what it calls.
  // For now, let's assume /accounts returns ACCOUNTS.

  // Checking service calls:
  // clients-list probably calls getAllclients or similar.
  // The service file had `getAllaccounts()` returning `Client[]`?
  // That seems like a typo in the user's provided service file.
  // Let's assume standard REST: /clients -> clients, /accounts -> accounts.

  // If request is for clients (hack: if logic detects it)
  // Actually, let's implement /clients route to be safe if I fix the service later.
  if (req.method === 'GET' && req.url.endsWith('/clients')) {
    return of(new HttpResponse({ status: 200, body: clients })).pipe(delay(delayMs));
  }

  // POST /api/transactions/deposit
  if (req.method === 'POST' && req.url.endsWith('/transactions/deposit')) {
    const { sourceAccount, amount, description } = req.body as any;
    const account = accounts.find((a) => a.id === sourceAccount.id);

    if (!account) {
      return throwError(
        () => new HttpErrorResponse({ status: 404, statusText: 'Account not found' })
      );
    }

    account.balance += amount;
    const tx: Transaction = {
      id: Math.floor(Math.random() * 10000),
      transactionType: 'DEPOSIT',
      amount: amount,
      description: description || 'Dépôt',
      transactionDate: new Date().toISOString(),
      destinationAccount: account, // Deposit goes TO this account
      sourceAccount: undefined, // External source
    };
    transactions.unshift(tx);
    saveState();

    return of(new HttpResponse({ status: 200, body: tx })).pipe(delay(delayMs));
  }

  // POST /api/transactions/withdraw
  if (req.method === 'POST' && req.url.endsWith('/transactions/withdraw')) {
    const { sourceAccount, amount, description } = req.body as any;
    const account = accounts.find((a) => a.id === sourceAccount.id);

    if (!account) {
      return throwError(
        () => new HttpErrorResponse({ status: 404, statusText: 'Account not found' })
      );
    }
    if (account.balance < amount) {
      return throwError(
        () => new HttpErrorResponse({ status: 400, error: { message: 'Solde insuffisant' } })
      );
    }

    account.balance -= amount;
    const tx: Transaction = {
      id: Math.floor(Math.random() * 10000),
      transactionType: 'WITHDRAWAL',
      amount: amount,
      description: description || 'Retrait',
      transactionDate: new Date().toISOString(),
      sourceAccount: account,
    };
    transactions.unshift(tx);
    saveState();

    return of(new HttpResponse({ status: 200, body: tx })).pipe(delay(delayMs));
  }

  // POST /api/transactions/transfer
  if (req.method === 'POST' && req.url.endsWith('/transactions/transfer')) {
    const { sourceAccount, destinationAccount, amount, description } = req.body as any;
    const source = accounts.find((a) => a.id === sourceAccount.id);
    const dest = accounts.find((a) => a.id === destinationAccount.id);

    if (!source || !dest) {
      return throwError(
        () => new HttpErrorResponse({ status: 404, statusText: 'One or more accounts not found' })
      );
    }
    if (source.balance < amount) {
      return throwError(
        () => new HttpErrorResponse({ status: 400, error: { message: 'Solde insuffisant' } })
      );
    }

    source.balance -= amount;
    dest.balance += amount;

    const tx: Transaction = {
      id: Math.floor(Math.random() * 10000),
      transactionType: 'TRANSFER',
      amount: amount,
      description: description || 'Virement',
      transactionDate: new Date().toISOString(),
      sourceAccount: source,
      destinationAccount: dest,
    };
    transactions.unshift(tx);
    saveState();

    return of(new HttpResponse({ status: 200, body: tx })).pipe(delay(delayMs));
  }

  // GET /api/transactions/account/:id
  // Regex to match /transactions/account/123
  const txAccountMatch = req.url.match(/\/transactions\/account\/(\d+)$/);
  if (req.method === 'GET' && txAccountMatch) {
    const accountId = parseInt(txAccountMatch[1]);
    const accountTxs = transactions.filter(
      (t) => t.sourceAccount?.id === accountId || t.destinationAccount?.id === accountId
    );
    return of(new HttpResponse({ status: 200, body: accountTxs })).pipe(delay(delayMs));
  }

  // GET /api/transactions/account/:id/date-range
  const txRangeMatch = req.url.match(/\/transactions\/account\/(\d+)\/date-range/);
  if (req.method === 'GET' && txRangeMatch) {
    const accountId = parseInt(txRangeMatch[1]);
    const startDate = req.params.get('startDate');
    const endDate = req.params.get('endDate');

    let filtered = transactions.filter(
      (t) => t.sourceAccount?.id === accountId || t.destinationAccount?.id === accountId
    );

    if (startDate) {
      filtered = filtered.filter((t) => t.transactionDate >= startDate);
    }
    if (endDate) {
      // Simple string comparison works for ISO dates, but ensure we include the full end day
      // or just strict comparison if user provides full iso.
      filtered = filtered.filter((t) => t.transactionDate <= endDate + 'T23:59:59');
    }

    return of(new HttpResponse({ status: 200, body: filtered })).pipe(delay(delayMs));
  }

  // Default: Pass through (will likely fail 404 if no backend, but that's expected)
  // Or better, return default empty for unknown GETs to avoid console red errors
  if (req.method === 'GET') {
    console.warn('MockBackend: Unhandled GET', req.url);
    // return of(new HttpResponse({ status: 200, body: [] }));
  }

  return next(req);
};
