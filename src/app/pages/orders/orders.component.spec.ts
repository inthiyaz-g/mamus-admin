import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { OrdersComponent } from './orders.component';
import { OrdersModule } from './orders.module';

describe('OrdersComponent operations', () => {
  let component: OrdersComponent;
  let api: any;
  let util: any;
  const response = { status: 200, success: true, data: [], totalOrders: 0, summary: {}, stores: [], today: '2026-09-05' };
  beforeEach(() => {
    api = { get_private: jasmine.createSpy().and.returnValue(Promise.resolve(response)) };
    util = { translate: (text: string) => text, apiErrorHandler: jasmine.createSpy(), downloadFile: jasmine.createSpy() };
    component = new OrdersComponent(util, api, { navigate: jasmine.createSpy() } as any);
  });
  afterEach(() => component.ngOnDestroy());
  it('sends combined filters and resets pagination for a new search', fakeAsync(() => {
    component.page = 4; component.inputString = 'Test & Store'; component.storeId = '5';
    component.statusFilter = 'in_progress'; component.dueFilter = 'today'; component.search(); tick();
    const params = new URLSearchParams(api.get_private.calls.mostRecent().args[0].split('?')[1]);
    expect(params.get('page')).toBe('0'); expect(params.get('search')).toBe('Test & Store');
    expect(params.get('store_id')).toBe('5'); expect(params.get('status')).toBe('in_progress'); expect(params.get('due')).toBe('today');
  }));
  it('clears a stale count on zero results', fakeAsync(() => {
    component.totalOrders = 55; component.getOrders(); tick();
    expect(component.totalOrders).toBe(0); expect(component.orders).toEqual([]); expect(component.dummy).toEqual([]);
  }));
  it('does not let an older search overwrite newer results', fakeAsync(() => {
    let first: any;
    api.get_private.and.returnValues(new Promise(resolve => first = resolve), Promise.resolve({ ...response, data: [{ id: 2 }], totalOrders: 1 }));
    component.getOrders(); component.search(); tick(); first({ ...response, data: [{ id: 1 }] }); tick();
    expect(component.orders[0].id).toBe(2);
  }));
  it('rejects an inverted date range before requesting orders', () => {
    component.dateFrom = '2026-09-06'; component.dateTo = '2026-09-05'; component.search();
    expect(api.get_private).not.toHaveBeenCalled(); expect(component.dateError).toContain('End date');
  });
  it('reads double-encoded rejected statuses and mixed-store active states', () => {
    expect(component.orderStatus({ status: JSON.stringify(JSON.stringify([{ id: '5', status: 'rejected' }])) })).toBe('rejected');
    expect(component.orderStatus({ status: [{ status: 'cancelled' }, { status: 'accepted' }] })).toBe('in_progress');
    expect(component.orderStatus({ status: 'garbage' })).toBe('unknown');
  });
  it('uses the absolute due day, not the original tomorrow label', () => {
    expect(component.dueLabel({ admin_status: 'created', delivery_schedule: 'tomorrow', due_bucket: 'today' })).toBe('Need to deliver today');
    expect(component.dueLabel({ admin_status: 'rejected', due_bucket: 'closed' })).not.toContain('Need to deliver');
    expect(component.formatDate(null)).toBe('Not recorded');
    expect(component.formatDate('2026-09-06', false)).toContain('06 Sept 2026');
  });
  it('resets every filter and preserves CSV store names and two-decimal totals', fakeAsync(() => {
    component.storeId = '5'; component.dueFilter = 'today'; component.page = 3; component.clean(); tick();
    expect(component.hasFilters).toBeFalse(); expect(component.page).toBe(1);
    component.orders = [{ id: 1, storeInfo: [{ name: 'Store, Restaurant' }], grand_total: 55.230000000000004, admin_status: 'delivered' }];
    component.exportCSV();
    const row = util.downloadFile.calls.mostRecent().args[0][0];
    expect(row.store).toBe('"Store, Restaurant"'); expect(row.total).toBe('"55.23"');
  }));
});

describe('OrdersComponent layout with the global CoreUI styles', () => {
  let fixture: ComponentFixture<OrdersComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ApiService, useValue: { get_private: () => Promise.resolve({ success: true, status: 200, data: [] }) } },
        { provide: UtilService, useValue: { translate: (text: string) => text, apiErrorHandler: jasmine.createSpy() } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(OrdersComponent);
    // Layout checks never load or alter production orders.
    spyOn(fixture.componentInstance, 'getOrders').and.stub();
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());

  it('keeps the in-progress metric full height and all card content inside its border', () => {
    const cards = Array.from(fixture.nativeElement.querySelectorAll('.metric')) as HTMLElement[];
    expect(cards.length).toBe(3);
    const heights = cards.map(card => card.getBoundingClientRect().height);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(108);
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(2);
    cards.forEach(card => {
      expect(card.classList.contains('progress')).toBeFalse();
      const bounds = card.getBoundingClientRect();
      const content = card.querySelector('.metric-content')!.getBoundingClientRect();
      expect(content.top).toBeGreaterThanOrEqual(bounds.top);
      expect(content.bottom).toBeLessThanOrEqual(bounds.bottom);
      expect(getComputedStyle(card).overflow).toBe('visible');
      expect(card.querySelector('.metric-icon svg use')).not.toBeNull();
    });
  });

  it('hides the accessible search label without taking space from the input', () => {
    const label = fixture.nativeElement.querySelector('.search-box .orders-visually-hidden');
    const style = getComputedStyle(label);
    expect(label.textContent).toBe('Search orders');
    expect(style.position).toBe('absolute');
    expect(style.width).toBe('1px');
    expect(style.height).toBe('1px');
    expect(style.overflow).toBe('hidden');
    expect(fixture.nativeElement.querySelectorAll('.sr-only').length).toBe(0);
  });

  it('stacks cards and search controls when the available content area is narrow', async () => {
    const host = fixture.nativeElement as HTMLElement;
    host.style.width = '360px';
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    const cards = Array.from(host.querySelectorAll('.metric')) as HTMLElement[];
    expect(cards[1].getBoundingClientRect().top).toBeGreaterThan(cards[0].getBoundingClientRect().bottom);
    const content = host.querySelector('.orders-workspace')!.getBoundingClientRect();
    cards.forEach(card => expect(card.getBoundingClientRect().right).toBeLessThanOrEqual(content.right));
    const search = host.querySelector('.search-box')!.getBoundingClientRect();
    const submit = host.querySelector('.search-row button[type="submit"]')!.getBoundingClientRect();
    expect(submit.top).toBeGreaterThanOrEqual(search.bottom);
    expect(host.querySelector('.filters-grid')!.getBoundingClientRect().right).toBeLessThanOrEqual(content.right);
  });
});
