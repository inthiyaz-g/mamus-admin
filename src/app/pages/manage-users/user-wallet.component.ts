import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';

interface WalletSummary {
  balance: string;
  total_credited: string;
  total_debited: string;
  transaction_count: number;
  pending_count: number;
}
interface WalletTransaction {
  id: number;
  reference: string;
  type: 'deposit' | 'withdraw';
  amount: string;
  confirmed: boolean;
  description: string;
  created_at: string | null;
}

@Component({
  selector: 'app-user-wallet',
  templateUrl: './user-wallet.component.html',
  styleUrls: ['./user-wallet.component.scss']
})
export class UserWalletComponent implements OnChanges, OnDestroy {
  @Input() userId: string | number;
  summary: WalletSummary | null = null;
  transactions: WalletTransaction[] = [];
  loading = false;
  errorMessage = '';
  typeFilter = '';
  confirmation = '';
  page = 1;
  total = 0;
  lastPage = 1;
  readonly perPage = 10;
  timezone = 'Asia/Kolkata';
  updatedAt: Date | null = null;
  private requestId = 0;
  constructor(private api: ApiService) {}

  ngOnChanges(): void {
    this.typeFilter = this.confirmation = '';
    this.page = 1;
    this.summary = null;
    this.transactions = [];
    this.total = 0;
    this.lastPage = 1;
    this.updatedAt = null;
    this.loadWallet();
  }
  ngOnDestroy(): void { this.requestId++; }

  async loadWallet(): Promise<void> {
    const request = ++this.requestId;
    const userId = String(this.userId || '');
    this.errorMessage = '';
    if (!/^[1-9]\d*$/.test(userId)) { this.loading = false; return; }
    this.loading = true;
    const params = new URLSearchParams({ page: String(this.page), per_page: String(this.perPage) });
    if (this.typeFilter) params.set('type', this.typeFilter);
    if (this.confirmation) params.set('confirmation', this.confirmation);
    try {
      const response: any = await this.api.get_private(`v1/users/${encodeURIComponent(userId)}/wallet?${params.toString()}`);
      if (request !== this.requestId) return;
      if (!response?.success || response.status !== 200 || Number(response.data?.user_id) !== Number(userId)) {
        throw new Error('Wallet response unavailable');
      }
      const data = response.data;
      this.summary = data.summary;
      this.transactions = data.transactions || [];
      this.total = Number(data.pagination.total);
      this.lastPage = Number(data.pagination.last_page);
      this.timezone = data.timezone || 'Asia/Kolkata';
      this.updatedAt = new Date();
      if (this.page > this.lastPage) {
        this.page = this.lastPage;
        await this.loadWallet();
      }
    } catch (error) {
      if (request !== this.requestId) return;
      this.summary = null;
      this.transactions = [];
      this.total = 0;
      this.errorMessage = 'Wallet details could not be loaded. Please try again.';
    } finally {
      if (request === this.requestId) this.loading = false;
    }
  }

  filterChanged(): void { this.page = 1; this.loadWallet(); }
  resetFilters(): void { this.typeFilter = this.confirmation = ''; this.filterChanged(); }
  changePage(page: number): void {
    if (this.loading || page < 1 || page > this.lastPage) return;
    this.page = page;
    this.loadWallet();
  }
  get rangeStart(): number { return this.total ? (this.page - 1) * this.perPage + 1 : 0; }
  get rangeEnd(): number { return Math.min(this.page * this.perPage, this.total); }
  money(value: string | number | null | undefined, absolute = false): string {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2,
      maximumFractionDigits: 2 }).format(absolute ? Math.abs(Number(value)) : Number(value));
  }
  date(value: string | null): string {
    if (!value || !Number.isFinite(Date.parse(value))) return 'Date not recorded';
    return new Intl.DateTimeFormat('en-IN', { timeZone: this.timezone, day: '2-digit', month: 'short',
      year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(value));
  }
}
