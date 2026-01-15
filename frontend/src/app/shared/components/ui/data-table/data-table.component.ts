import { Component, Input, Output, EventEmitter, signal, computed, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => string;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      [class]="'w-full bg-white rounded-2xl ' + (bordered ? 'border border-slate-200 ' : '') + className"
    >
      <!-- Search and Filters -->
      @if (searchable) {
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border-b border-slate-200">
          <div class="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
            <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input
              type="text"
              [placeholder]="searchPlaceholder"
              [(ngModel)]="search"
              (ngModelChange)="currentPage.set(1)"
              class="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-2xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
      }

      <!-- Table Container -->
      <div
        [class]="'overflow-hidden bg-slate-50/30 ' + (searchable ? 'rounded-b-2xl' : 'rounded-2xl')"
      >
        <div class="overflow-x-auto">
          <table class="w-full min-w-full">
            <thead class="bg-slate-50/50">
              <tr>
                @for (column of columns; track column.key) {
                  <th
                    [style.width]="column.width"
                    (click)="column.sortable && handleSort(column.key)"
                    [class]="'text-left font-medium text-slate-500 bg-slate-50/50 ' + 
                            (compact ? 'px-4 py-3 ' : 'px-6 py-4 ') + 
                            (column.sortable ? 'cursor-pointer hover:bg-slate-100 transition-colors' : '')"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-slate-700">
                          {{ column.header }}
                        </span>
                        @if (column.sortable) {
                          <div class="flex flex-col">
                            <svg [class]="'h-3 w-3 ' + (sortConfig().key === column.key && sortConfig().direction === 'asc' ? 'text-blue-600' : 'text-slate-300')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                            <svg [class]="'h-3 w-3 -mt-1 ' + (sortConfig().key === column.key && sortConfig().direction === 'desc' ? 'text-blue-600' : 'text-slate-300')" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </div>
                        }
                      </div>
                      @if (column.filterable) {
                        <div class="relative">
                          <svg class="h-3 w-3 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        </div>
                      }
                    </div>

                    <!-- Column Filter -->
                    @if (column.filterable) {
                      <div class="mt-3 relative" (click)="$event.stopPropagation()">
                        <input
                          type="text"
                          placeholder="Filtre..."
                          [ngModel]="getFilterValue(column.key)"
                          (ngModelChange)="setFilterValue(column.key, $event)"
                          class="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                        @if (getFilterValue(column.key)) {
                          <button
                            (click)="clearColumnFilter(column.key)"
                            class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            ✕
                          </button>
                        }
                      </div>
                    }
                  </th>
                }
              </tr>
            </thead>
            
            <tbody class="bg-white">
              @if (loading) {
                @for (i of [1,2,3,4,5]; track i) {
                  <tr class="animate-pulse border-t border-slate-100">
                    @for (col of columns; track col.key) {
                      <td [class]="compact ? 'px-4 py-3' : 'px-6 py-4'">
                        <div class="h-4 bg-slate-100 rounded w-full"></div>
                      </td>
                    }
                  </tr>
                }
              } @else if (paginatedData().length === 0) {
                <tr>
                  <td
                    [attr.colspan]="columns.length"
                    [class]="'text-center text-slate-400 bg-white ' + (compact ? 'px-4 py-12' : 'px-6 py-16')"
                  >
                    <div class="flex flex-col items-center space-y-2">
                      <div class="text-4xl">📊</div>
                      <div class="font-medium">{{ emptyMessage }}</div>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (row of paginatedData(); track row; let i = $index) {
                  <tr
                    (click)="onRowClick.emit({row, index: i, event: $event})"
                    [class]="'border-t border-slate-100 transition-colors ' + 
                            (striped && i % 2 === 0 ? 'bg-slate-50/50 ' : 'bg-white ') + 
                            (hoverable ? 'hover:bg-slate-50 ' : '') + 
                            (onRowClick.observers.length > 0 ? 'cursor-pointer' : '')"
                  >
                    @for (column of columns; track column.key) {
                      <td
                        [class]="'text-sm text-slate-600 ' + (compact ? 'px-4 py-3' : 'px-6 py-4')"
                      >
                        @if (column.render) {
                          <div [innerHTML]="column.render(row[column.key], row)"></div>
                        } @else {
                          {{ row[column.key] }}
                        }
                      </td>
                    }
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      @if (showPagination && totalPages() > 1) {
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border-t border-slate-100">
          <div class="text-sm text-slate-500 order-2 sm:order-1">
            Affichage de {{ (currentPage() - 1) * itemsPerPage + 1 }} à 
            {{ getMinDisplay() }} sur 
            {{ sortedData().length }} résultats
          </div>
          <div class="flex items-center gap-2 order-1 sm:order-2">
            <button
              (click)="prevPage()"
              [disabled]="currentPage() === 1"
              class="px-3 py-2 text-sm border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Précédent
            </button>
            
            <div class="hidden sm:flex items-center gap-1">
              @for (page of pageNumbers(); track page) {
                <button
                  (click)="currentPage.set(page)"
                  [class]="'px-3 py-2 text-sm border rounded-2xl transition-colors ' + 
                          (currentPage() === page 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600')"
                >
                  {{ page }}
                </button>
              }
            </div>

            <button
              (click)="nextPage()"
              [disabled]="currentPage() === totalPages()"
              class="px-3 py-2 text-sm border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class DataTableComponent<T extends Record<string, any>> {
  @Input() data: T[] = [];
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() className = '';
  @Input() searchable = true;
  @Input() searchPlaceholder = 'Rechercher...';
  @Input() itemsPerPage = 10;
  @Input() showPagination = true;
  @Input() striped = false;
  @Input() hoverable = true;
  @Input() bordered = true;
  @Input() compact = false;
  @Input() loading = false;
  @Input() emptyMessage = 'Aucune donnée disponible';

  @Output() onRowClick = new EventEmitter<{ row: T; index: number; event: MouseEvent }>();

  // Use model/signals for internal state
  search = signal('');
  sortConfig = signal<{ key: keyof T | string | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });
  currentPage = signal(1);
  columnFilters = signal<Record<string, string>>({});

  // Computed signals
  filteredData = computed(() => {
    let filtered = [...this.data];
    const searchTerm = this.search().toLowerCase();
    const filters = this.columnFilters();

    // Global search
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        this.columns.some((column) => {
          const value = row[column.key as keyof T];
          return value?.toString().toLowerCase().includes(searchTerm);
        }),
      );
    }

    // Column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        const val = value.toLowerCase();
        filtered = filtered.filter((row) => {
          const rowValue = row[key as keyof T];
          return rowValue?.toString().toLowerCase().includes(val);
        });
      }
    });

    return filtered;
  });

  sortedData = computed(() => {
    const data = this.filteredData();
    const config = this.sortConfig();

    if (!config.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[config.key as keyof T];
      const bValue = b[config.key as keyof T];

      if (aValue === bValue) return 0;
      if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
      return config.direction === 'asc' ? 1 : -1;
    });
  });

  paginatedData = computed(() => {
    const data = this.sortedData();
    if (!this.showPagination) return data;

    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return data.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.filteredData().length / this.itemsPerPage));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const length = Math.min(total, 5);
    
    let start = Math.max(1, current - 2);
    if (start + length > total) {
      start = Math.max(1, total - length + 1);
    }
    
    return Array.from({ length }, (_, i) => start + i);
  });

  handleSort(key: keyof T | string) {
    this.sortConfig.update((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  }

  getFilterValue(key: keyof T | string): string {
    return this.columnFilters()[key as string] || '';
  }

  setFilterValue(key: keyof T | string, value: string) {
    this.columnFilters.update((prev) => ({
      ...prev,
      [key as string]: value,
    }));
    this.currentPage.set(1);
  }

  clearColumnFilter(key: keyof T | string) {
    this.columnFilters.update((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key as string];
      return newFilters;
    });
    this.currentPage.set(1);
  }

  prevPage() {
    this.currentPage.update(v => Math.max(v - 1, 1));
  }

  nextPage() {
    this.currentPage.update(v => Math.min(v + 1, this.totalPages()));
  }

  getMinDisplay() {
    return Math.min(this.currentPage() * this.itemsPerPage, this.sortedData().length);
  }
}
