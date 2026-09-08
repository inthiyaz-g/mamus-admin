import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { AdminOrderDispatchComponent, DispatchStore } from './admin-order-dispatch.component';

const rider = { id: 501, name: 'Test Rider', mobile: '0000000000' };
const store = (status = 'created'): DispatchStore => ({ store_id: '10', store_name: 'Test Store', status,
  can_accept: status === 'created', can_assign: status === 'accepted', blocked_reason: null,
  assigned_rider: null, available_riders: status === 'accepted' ? [rider] : [] });
const response = (status = 'created', id = 100) => ({ success: true, status: 200, message: 'Saved',
  data: { order_id: id, delivery_type: 'scheduled', order_to: 'home', stores: [store(status)] } });

describe('Admin order dispatch', () => {
  let component: AdminOrderDispatchComponent;
  let api: any;
  beforeEach(() => {
    api = { get_private: jasmine.createSpy().and.returnValue(Promise.resolve(response())),
      post_private: jasmine.createSpy().and.returnValue(Promise.resolve(response('accepted'))) };
    component = new AdminOrderDispatchComponent(api, { translate: (text: string) => text } as UtilService);
    component.orderId = 100;
  });
  afterEach(() => component.ngOnDestroy());
  it('loads server-owned per-store capabilities', fakeAsync(() => {
    component.ngOnChanges(); tick();
    expect(api.get_private).toHaveBeenCalledWith('v1/orders/100/dispatch');
    expect(component.data?.stores[0].can_accept).toBeTrue(); expect(component.loading).toBeFalse();
  }));
  it('requires confirmation to accept and refreshes parent details after success', fakeAsync(() => {
    component.ngOnChanges(); tick(); const changed = spyOn(component.changed, 'emit');
    component.prepareAccept(component.data!.stores[0]);
    expect(api.post_private).not.toHaveBeenCalled();
    component.confirm(); tick();
    expect(api.post_private).toHaveBeenCalledWith('v1/orders/100/dispatch/accept', { store_id: '10' });
    expect(component.data?.stores[0].can_assign).toBeTrue(); expect(changed).toHaveBeenCalledTimes(1);
    expect(component.pending).toBeNull();
  }));
  it('assigns only the selected available rider and selected store', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.resolve(response('accepted')));
    component.ngOnChanges(); tick();
    const assigned = response('accepted'); assigned.data.stores[0].assigned_rider = rider;
    assigned.data.stores[0].can_assign = false; assigned.data.stores[0].available_riders = [];
    api.post_private.and.returnValue(Promise.resolve(assigned));
    component.selectedRiders['10'] = '501'; component.prepareAssign(component.data!.stores[0]); component.confirm(); tick();
    expect(api.post_private).toHaveBeenCalledWith('v1/orders/100/dispatch/assign', { store_id: '10', driver_id: 501 });
    expect(component.data!.stores[0].assigned_rider?.id).toBe(501); expect(component.selectedRiders['10']).toBeUndefined();
  }));
  it('does not assign arbitrary or unavailable riders', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.resolve(response('accepted'))); component.ngOnChanges(); tick();
    component.selectedRiders['10'] = '999'; component.prepareAssign(component.data!.stores[0]); component.confirm(); tick();
    expect(component.pending).toBeNull(); expect(api.post_private).not.toHaveBeenCalled();
  }));
  it('prevents duplicate submission and cancels without any mutation', fakeAsync(() => {
    let resolve: any;
    api.post_private.and.returnValue(new Promise(done => resolve = done)); component.ngOnChanges(); tick();
    component.prepareAccept(component.data!.stores[0]); component.cancel(); component.confirm(); tick();
    expect(api.post_private).not.toHaveBeenCalled();
    component.prepareAccept(component.data!.stores[0]); component.confirm(); component.confirm(); component.cancel();
    expect(api.post_private).toHaveBeenCalledTimes(1); expect(component.pending).not.toBeNull();
    resolve(response('accepted')); tick(); expect(component.busy).toBeFalse();
  }));
  it('refreshes current state on conflict without optimistic success', fakeAsync(() => {
    component.ngOnChanges(); tick(); component.prepareAccept(component.data!.stores[0]);
    api.post_private.and.returnValue(Promise.reject({ status: 409, error: { message: 'Order already closed.' } }));
    api.get_private.and.returnValue(Promise.resolve(response('cancelled')));
    component.confirm(); tick();
    expect(component.errorMessage).toBe('Order already closed.'); expect(component.successMessage).toBe('');
    expect(component.data!.stores[0].status).toBe('cancelled'); expect(component.pending).toBeNull();
  }));
  it('ignores a previous order request after navigating', fakeAsync(() => {
    let old: any;
    api.get_private.and.returnValues(new Promise(done => old = done), Promise.resolve(response('created', 101)));
    component.ngOnChanges(); component.orderId = 101; component.ngOnChanges(); tick(); old(response()); tick();
    expect(component.data!.order_id).toBe(101);
  }));
  it('ignores a mutation response from a previous order', fakeAsync(() => {
    let old: any;
    component.ngOnChanges(); tick(); component.prepareAccept(component.data!.stores[0]);
    api.post_private.and.returnValue(new Promise(done => old = done)); component.confirm();
    api.get_private.and.returnValue(Promise.resolve(response('created', 101)));
    component.orderId = 101; component.ngOnChanges(); tick(); old(response('accepted')); tick();
    expect(component.data!.order_id).toBe(101); expect(component.successMessage).toBe(''); expect(component.busy).toBeFalse();
  }));
  it('fails closed for missing data and invalid IDs', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.reject(new Error('Offline'))); component.ngOnChanges(); tick();
    expect(component.data).toBeNull(); expect(component.errorMessage).toContain('could not be loaded');
    api.get_private.calls.reset(); component.orderId = '../100'; component.ngOnChanges(); tick();
    expect(api.get_private).not.toHaveBeenCalled();
  }));
  it('does not expose actions when the backend disables them', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.resolve(response('delivered'))); component.ngOnChanges(); tick();
    component.prepareAccept(component.data!.stores[0]); component.prepareAssign(component.data!.stores[0]); component.confirm(); tick();
    expect(api.post_private).not.toHaveBeenCalled();
  }));
});

describe('Admin dispatch UI', () => {
  let fixture: ComponentFixture<AdminOrderDispatchComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CommonModule, FormsModule], declarations: [AdminOrderDispatchComponent],
      providers: [{ provide: ApiService, useValue: {} }, { provide: UtilService, useValue: { translate: (text: string) => text } }] }).compileComponents();
    fixture = TestBed.createComponent(AdminOrderDispatchComponent);
    fixture.componentInstance.data = response().data; fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());
  it('shows separate confirmation before acceptance', () => {
    const root: HTMLElement = fixture.nativeElement;
    (root.querySelector('.dispatch-accept-row button') as HTMLButtonElement).click(); fixture.detectChanges();
    expect(root.textContent).toContain('Confirm acceptance'); expect(root.textContent).toContain('scheduled delivery date will not change');
  });
  it('explains unavailable riders and keeps closed orders read-only', () => {
    fixture.componentInstance.data = response('accepted').data;
    fixture.componentInstance.data.stores[0].available_riders = []; fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('No available riders'); expect(root.querySelector('select')).toBeNull();
    fixture.componentInstance.data = response('cancelled').data; fixture.detectChanges();
    expect(root.querySelector('.dispatch-primary')).toBeNull();
  });
  it('contains cards and confirmation actions within a narrow column', () => {
    const root: HTMLElement = fixture.nativeElement; root.style.width = '350px';
    fixture.componentInstance.prepareAccept(fixture.componentInstance.data!.stores[0]); fixture.detectChanges();
    const bounds = root.getBoundingClientRect();
    for (const node of Array.from(root.querySelectorAll('.dispatch-store, .dispatch-confirm-actions'))) {
      expect(node.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.right);
    }
  });
});
