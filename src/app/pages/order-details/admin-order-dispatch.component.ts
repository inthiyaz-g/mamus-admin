import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

export interface DispatchRider { id: string | number; name: string; mobile: string; }
export interface DispatchStore {
  store_id: string; store_name: string; status: string; can_accept: boolean; can_assign: boolean;
  blocked_reason: string | null; assigned_rider: DispatchRider | null; available_riders: DispatchRider[];
}
export interface DispatchState { order_id: number; delivery_type: string; order_to: string; stores: DispatchStore[]; }
interface PendingDispatch { action: 'accept' | 'assign'; store: DispatchStore; rider?: DispatchRider; }

@Component({ selector: 'app-admin-order-dispatch', templateUrl: './admin-order-dispatch.component.html',
  styleUrls: ['./admin-order-dispatch.component.scss'] })
export class AdminOrderDispatchComponent implements OnChanges, OnDestroy {
  @Input() orderId: string | number;
  @Output() changed = new EventEmitter<void>();
  data: DispatchState | null = null;
  loading = false;
  busy = false;
  errorMessage = '';
  successMessage = '';
  selectedRiders: { [storeId: string]: string } = {};
  pending: PendingDispatch | null = null;
  private epoch = 0;
  private loadId = 0;
  constructor(private api: ApiService, public util: UtilService) {}

  ngOnChanges(): void {
    this.epoch++;
    this.data = null; this.pending = null; this.selectedRiders = {};
    this.loading = this.busy = false; this.errorMessage = this.successMessage = '';
    this.loadDispatch();
  }
  ngOnDestroy(): void { this.epoch++; this.loadId++; }
  refresh(): void {
    if (this.busy || this.loading) return;
    this.pending = null; this.successMessage = ''; this.loadDispatch();
  }
  async loadDispatch(preserveError = false): Promise<void> {
    const id = String(this.orderId || '');
    if (!/^[1-9]\d*$/.test(id)) return;
    const epoch = this.epoch;
    const request = ++this.loadId;
    this.loading = true;
    if (!preserveError) this.errorMessage = '';
    try {
      const response: any = await this.api.get_private(`v1/orders/${id}/dispatch`);
      if (epoch !== this.epoch || request !== this.loadId) return;
      this.applyResponse(response, id);
    } catch (error) {
      if (epoch !== this.epoch || request !== this.loadId) return;
      this.data = null;
      if (!preserveError) this.errorMessage = 'Dispatch details could not be loaded. Please try again.';
    } finally {
      if (epoch === this.epoch && request === this.loadId) this.loading = false;
    }
  }
  private applyResponse(response: any, id: string): void {
    if (!response?.success || response.status !== 200 || Number(response.data?.order_id) !== Number(id)
      || !Array.isArray(response.data?.stores)) throw new Error('Invalid dispatch response');
    const data: DispatchState = response.data;
    this.data = data;
    const selected: { [storeId: string]: string } = {};
    data.stores.forEach(store => {
      const previous = this.selectedRiders[store.store_id];
      if (store.can_assign && store.available_riders.some(rider => String(rider.id) === previous)) selected[store.store_id] = previous;
    });
    this.selectedRiders = selected;
  }
  prepareAccept(store: DispatchStore): void {
    if (this.busy || this.loading || !store.can_accept || !this.data?.stores.includes(store)) return;
    this.pending = { action: 'accept', store }; this.errorMessage = this.successMessage = '';
  }
  prepareAssign(store: DispatchStore): void {
    if (this.busy || this.loading || !store.can_assign || !this.data?.stores.includes(store)) return;
    const rider = store.available_riders.find(value => String(value.id) === this.selectedRiders[store.store_id]);
    if (!rider) return;
    this.pending = { action: 'assign', store, rider }; this.errorMessage = this.successMessage = '';
  }
  cancel(): void { if (!this.busy) this.pending = null; }
  async confirm(): Promise<void> {
    const pending = this.pending;
    if (!pending || this.busy || this.loading || !this.data?.stores.includes(pending.store)) return;
    if ((pending.action === 'accept' && !pending.store.can_accept)
      || (pending.action === 'assign' && (!pending.store.can_assign || !pending.rider))) return;
    const id = String(this.orderId);
    const epoch = this.epoch;
    this.busy = true; this.errorMessage = this.successMessage = '';
    const payload: any = { store_id: pending.store.store_id };
    if (pending.rider) payload.driver_id = pending.rider.id;
    try {
      const response: any = await this.api.post_private(`v1/orders/${id}/dispatch/${pending.action}`, payload);
      if (epoch !== this.epoch) return;
      this.applyResponse(response, id);
      this.pending = null;
      this.successMessage = response.message || (pending.action === 'accept' ? 'Order accepted successfully.' : 'Rider assigned successfully.');
      this.changed.emit();
    } catch (error) {
      if (epoch !== this.epoch) return;
      const message = (error as any)?.error?.message;
      this.errorMessage = typeof message === 'string' ? message.slice(0, 300)
        : 'The update could not be confirmed. Check the latest order status before trying again.';
      this.pending = null;
      // A store or another admin may have changed the order/rider since it was loaded.
      await this.loadDispatch(true);
      if (epoch === this.epoch) this.changed.emit();
    } finally { if (epoch === this.epoch) this.busy = false; }
  }
  statusLabel(status: string): string {
    const labels: { [key: string]: string } = { created: 'New order', new: 'New order', awaiting_admin_acceptance: 'Awaiting acceptance',
      accepted: 'Accepted', ongoing: 'Rider assigned', dispatched: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled',
      canceled: 'Cancelled', rejected: 'Rejected', refund: 'Refunded', refunded: 'Refunded' };
    return labels[status] || status?.replace(/_/g, ' ') || 'Status unavailable';
  }
}
