import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ApiService } from 'src/app/services/api.service';
import { UserWalletComponent } from './user-wallet.component';

const walletResponse = (userId = 246) => ({ success: true, status: 200, data: {
  user_id: userId, timezone: 'Asia/Kolkata', currency: 'INR',
  summary: { balance: '75', total_credited: '100', total_debited: '25', transaction_count: 3, pending_count: 1 },
  transactions: [
    { id: 3, reference: 'pending-ref', type: 'deposit', amount: '50', confirmed: false, description: 'Wallet credit', created_at: '2026-09-06T01:00:00Z' },
    { id: 2, reference: 'debit-ref', type: 'withdraw', amount: '-25', confirmed: true, description: 'Wallet debit', created_at: '2026-09-05T10:00:00Z' }
  ], pagination: { page: 1, total: 3, per_page: 10, last_page: 1 }
} });

describe('UserWalletComponent', () => {
  let component: UserWalletComponent;
  let api: any;
  beforeEach(() => {
    api = { get_private: jasmine.createSpy().and.returnValue(Promise.resolve(walletResponse())) };
    component = new UserWalletComponent(api); component.userId = 246;
  });
  afterEach(() => component.ngOnDestroy());
  it('loads the selected user wallet and formats rupees with two decimal places', fakeAsync(() => {
    component.ngOnChanges(); tick();
    expect(api.get_private).toHaveBeenCalledWith('v1/users/246/wallet?page=1&per_page=10');
    expect(component.money(component.summary?.balance)).toBe('₹75.00');
    expect(component.money('-25', true)).toBe('₹25.00');
    expect(component.total).toBe(3); expect(component.loading).toBeFalse();
  }));
  it('combines filters and resets pagination', fakeAsync(() => {
    component.page = 3; component.typeFilter = 'withdraw'; component.confirmation = 'confirmed'; component.filterChanged(); tick();
    expect(api.get_private.calls.mostRecent().args[0]).toContain('page=1&per_page=10&type=withdraw&confirmation=confirmed');
    expect(component.summary?.total_credited).toBe('100');
  }));
  it('does not display an older user response after switching users', fakeAsync(() => {
    let oldResponse: any;
    api.get_private.and.returnValues(new Promise(resolve => oldResponse = resolve), Promise.resolve(walletResponse(247)));
    component.ngOnChanges(); component.userId = 247; component.ngOnChanges(); tick();
    oldResponse({ ...walletResponse(), data: { ...walletResponse().data, summary: { balance: '999' } } }); tick();
    expect(component.summary?.balance).toBe('75');
  }));
  it('shows an error rather than a false zero balance and supports retry', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.reject(new Error('Unavailable')));
    component.ngOnChanges(); tick();
    expect(component.summary).toBeNull(); expect(component.errorMessage).toContain('could not be loaded');
    api.get_private.and.returnValue(Promise.resolve(walletResponse())); component.loadWallet(); tick();
    expect(component.errorMessage).toBe(''); expect(component.summary?.balance).toBe('75');
  }));
  it('handles zero transactions and validates page boundaries', fakeAsync(() => {
    const response = walletResponse(); response.data.transactions = []; response.data.pagination.total = 0;
    api.get_private.and.returnValue(Promise.resolve(response)); component.loadWallet(); tick();
    expect(component.rangeStart).toBe(0); expect(component.rangeEnd).toBe(0);
    const count = api.get_private.calls.count(); component.changePage(0); component.changePage(2);
    expect(api.get_private.calls.count()).toBe(count);
  }));
  it('clears filters on a user change and does not request invalid user IDs', fakeAsync(() => {
    component.typeFilter = 'deposit'; component.page = 3; component.ngOnChanges(); tick();
    expect(component.typeFilter).toBe(''); expect(component.page).toBe(1);
    api.get_private.calls.reset(); component.userId = '../users'; component.ngOnChanges(); tick();
    expect(api.get_private).not.toHaveBeenCalled(); expect(component.summary).toBeNull();
  }));
});

describe('User wallet display', () => {
  let fixture: ComponentFixture<UserWalletComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CommonModule, FormsModule], declarations: [UserWalletComponent],
      providers: [{ provide: ApiService, useValue: {} }] }).compileComponents();
    fixture = TestBed.createComponent(UserWalletComponent);
    fixture.componentInstance.summary = walletResponse().data.summary;
    fixture.componentInstance.transactions = walletResponse().data.transactions as any;
    fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());
  it('shows credits, debits, pending status and safe transaction references', () => {
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('₹75.00'); expect(root.textContent).toContain('−₹25.00');
    expect(root.textContent).toContain('+₹50.00'); expect(root.textContent).toContain('Pending');
    expect(root.textContent).toContain('pending-ref'); expect(root.textContent).toContain('Read only');
    expect(Array.from(root.querySelectorAll('button')).some(button => /deposit|withdraw|add money/i.test(button.textContent || ''))).toBeFalse();
  });
  it('keeps transaction content contained at a narrow width', () => {
    const root: HTMLElement = fixture.nativeElement; root.style.width = '340px';
    const content = root.querySelector('.user-wallet')!.getBoundingClientRect();
    for (const element of Array.from(root.querySelectorAll('.wallet-entry, .wallet-summary-grid, .wallet-filters'))) {
      expect(element.getBoundingClientRect().right).toBeLessThanOrEqual(content.right);
    }
  });
});
