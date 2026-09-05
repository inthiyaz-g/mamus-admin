/* Mamus Admin — order operations workspace. */
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({ selector: 'app-orders', templateUrl: './orders.component.html', styleUrls: ['./orders.component.scss'] })
export class OrdersComponent implements OnInit, OnDestroy {
  @ViewChild('myModal3') public myModal3: ModalDirective;
  dummy: any[] = [];
  orders: any[] = [];
  stores: any[] = [];
  totalOrders = 0;
  page = 1;
  inputString = '';
  storeId = '';
  statusFilter = '';
  deliveryType = '';
  dueFilter = '';
  dateField = 'ordered';
  dateFrom = '';
  dateTo = '';
  summary: { [key: string]: number } = {};
  errorMessage = '';
  dateError = '';
  timezone = 'Asia/Kolkata';
  today = this.businessDay();
  lastUpdated: Date;
  private requestId = 0;
  private dayTimer: ReturnType<typeof setInterval>;
  readonly tabs = [
    { key: '', count: 'all', label: 'All orders' }, { key: 'new', count: 'new', label: 'New' },
    { key: 'in_progress', count: 'in_progress', label: 'In progress' }, { key: 'delivered', count: 'delivered', label: 'Delivered' },
    { key: 'cancelled', count: 'cancelled', label: 'Cancelled' }, { key: 'rejected', count: 'rejected', label: 'Rejected' }
  ];
  constructor(public util: UtilService, public api: ApiService, private router: Router) {}
  ngOnInit(): void {
    this.getOrders();
    this.dayTimer = setInterval(() => { if (this.businessDay() !== this.today) this.getOrders(); }, 60000);
  }
  ngOnDestroy(): void { clearInterval(this.dayTimer); this.requestId++; }
  private businessDay(): string {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: this.timezone || 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const part = (type: string) => parts.find(value => value.type === type)?.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  async getOrders(): Promise<void> {
    const request = ++this.requestId;
    this.dateError = this.dateFrom && this.dateTo && this.dateFrom > this.dateTo ? 'End date must be on or after the start date.' : '';
    if (this.dateError) { this.dummy = []; return; }
    const params = new URLSearchParams({ page: String(this.page - 1) });
    const filters = { search: this.inputString.trim(), store_id: this.storeId, status: this.statusFilter,
      delivery_type: this.deliveryType, due: this.dueFilter, date_field: this.dateField, date_from: this.dateFrom, date_to: this.dateTo };
    Object.entries(filters).forEach(([key, value]) => { if (value) params.set(key, value); });
    this.dummy = Array(5); this.errorMessage = '';
    try {
      const data: any = await this.api.get_private('v1/orders/getAll?' + params.toString());
      if (request !== this.requestId) return;
      if (!data?.success || data.status !== 200) throw new Error('Unable to load orders.');
      this.orders = data.data || []; this.totalOrders = Number(data.totalOrders || 0);
      this.stores = data.stores || []; this.summary = data.summary || {};
      this.timezone = data.timezone || 'Asia/Kolkata'; this.today = data.today || this.businessDay(); this.lastUpdated = new Date();
      if (!this.orders.length && this.totalOrders > 0 && this.page > 1) {
        this.page = Math.ceil(this.totalOrders / 10); await this.getOrders();
      }
    } catch (error) {
      if (request !== this.requestId) return;
      this.orders = []; this.totalOrders = 0; this.summary = {};
      this.errorMessage = 'Orders could not be loaded. Please try again.'; this.util.apiErrorHandler(error);
    } finally { if (request === this.requestId) this.dummy = []; }
  }
  search(): void { this.page = 1; this.getOrders(); }
  pageChange(page: number): void { this.page = page; this.getOrders(); }
  selectStatus(status: string): void { this.statusFilter = status; this.search(); }
  selectDue(due: string): void { this.dueFilter = this.dueFilter === due ? '' : due; this.statusFilter = ''; this.search(); }
  clean(): void {
    this.inputString = this.storeId = this.statusFilter = this.deliveryType = this.dueFilter = this.dateFrom = this.dateTo = '';
    this.dateField = 'ordered'; this.search();
  }
  get hasFilters(): boolean { return !!(this.inputString || this.storeId || this.statusFilter || this.deliveryType || this.dueFilter || this.dateFrom || this.dateTo); }
  get rangeStart(): number { return this.totalOrders ? (this.page - 1) * 10 + 1 : 0; }
  get rangeEnd(): number { return Math.min(this.page * 10, this.totalOrders); }
  getNames(stores: any): string { return (stores || []).map((store: any) => store?.name).filter(Boolean).join(', '); }
  viewsInfo(id: any): void { this.router.navigate(['order-details'], { queryParams: { id } }); }
  deliveryLabel(order: any): string { return this.util.translate(order.delivery_type === 'instant' ? 'Instant' : 'Scheduled'); }
  orderStatus(order: any): string {
    if (order.admin_status) return order.admin_status;
    // Compatibility while the API and admin bundles deploy independently.
    let value: any = order.status;
    for (let i = 0; i < 3 && typeof value === 'string'; i++) { try { value = JSON.parse(value); } catch { break; } }
    if (value?.status) value = [value];
    const aliases: any = { canceled: 'cancelled', refund: 'refunded', awaiting_admin_acceptance: 'created', out_for_delivery: 'ongoing' };
    const statuses = [...new Set((Array.isArray(value) ? value : [value]).map((item: any) => {
      const status = String(item?.status || item || '').trim().toLowerCase(); return aliases[status] || status;
    }))] as string[];
    if (!statuses.length || statuses.some(status => !['created', 'accepted', 'ongoing', 'delivered', 'rejected', 'cancelled', 'refunded'].includes(status))) return 'unknown';
    if (statuses.length === 1) return statuses[0];
    if (statuses.some(status => ['created', 'accepted', 'ongoing'].includes(status))) return 'in_progress';
    if (statuses.includes('delivered')) return 'partially_completed';
    return statuses.includes('refunded') ? 'refunded' : statuses.includes('rejected') ? 'rejected' : 'cancelled';
  }
  orderStatusLabel(order: any): string {
    const labels: any = { created: 'New', accepted: 'Accepted', ongoing: 'Out for delivery', in_progress: 'In progress',
      delivered: 'Delivered', cancelled: 'Cancelled', rejected: 'Rejected', refunded: 'Refunded', partially_completed: 'Partially completed', unknown: 'Unknown' };
    return this.util.translate(labels[this.orderStatus(order)] || 'Unknown');
  }
  dueLabel(order: any): string {
    if (!['created', 'accepted', 'ongoing', 'in_progress'].includes(this.orderStatus(order))) return 'Delivery was scheduled for';
    const labels: any = { today: 'Need to deliver today', tomorrow: 'Deliver tomorrow', overdue: 'Overdue · needs attention', upcoming: 'Upcoming delivery' };
    return labels[order.due_bucket] || 'Delivery date';
  }
  formatDate(value: any, includeTime = true): string {
    if (!value) return 'Not recorded';
    const raw = String(value);
    const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw + 'T00:00:00+05:30' : raw);
    if (isNaN(parsed.getTime())) return 'Not recorded';
    return new Intl.DateTimeFormat('en-IN', { timeZone: this.timezone, day: '2-digit', month: 'short', year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: true } : {}) }).format(parsed);
  }
  exportCSV(): void {
    const quote = (value: any) => '"' + String(value ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
    const rows = this.orders.map(order => ({ id: order.id, customer: `${order.first_name || ''} ${order.last_name || ''}`.trim(),
      store: this.getNames(order.storeInfo), ordered_at: this.formatDate(order.placed_at), deliver_on: this.formatDate(order.delivery_due_date, false),
      delivered_at: order.delivered_at ? this.formatDate(order.delivered_at) : 'Not recorded', total: Number(order.grand_total || 0).toFixed(2),
      delivery: this.deliveryLabel(order), status: this.orderStatusLabel(order), order_to: order.order_to }));
    if (!rows.length) return;
    const keys = Object.keys(rows[0]);
    const escaped = rows.map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, quote(value)])));
    this.util.downloadFile(escaped, 'orders-page-' + this.page, keys);
  }
  saveType(): void { this.myModal3.hide(); }
  importCSV(): void { this.myModal3.show(); }
  downloadSample(): void { window.open('assets/sample/orders.csv', '_blank'); }
  uploadCSV(files: any): void {
    if (!files?.length || !/\.csv$/i.test(files[0].name)) return;
    this.util.show();
    this.api.uploaCSV(files, 'v1/orders/importData').subscribe(() => {
      this.util.hide(); this.myModal3.hide(); this.util.success('Uploaded'); this.search();
    }, error => { this.util.hide(); this.util.apiErrorHandler(error); });
  }
}
