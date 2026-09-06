/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { UsersComponent } from './users.component';

const response = (totalUsers = 1, id = 246) => ({ success: true, status: 200, totalUsers,
  data: totalUsers ? [{ id, first_name: 'Anil', last_name: 'Kumar', mobile: '8564314900', email: 'anil@example.test', status: 1 }] : [] });

describe('Users search', () => {
  let component: UsersComponent;
  let api: any;
  let util: any;
  beforeEach(() => {
    api = { get_private: jasmine.createSpy().and.returnValue(Promise.resolve(response())) };
    util = { apiErrorHandler: jasmine.createSpy() };
    component = new UsersComponent({} as Router, api, util);
  });
  afterEach(() => component.ngOnDestroy());

  it('loads the first page using the existing zero-based API contract', fakeAsync(() => {
    component.ngOnInit(); tick();
    expect(api.get_private).toHaveBeenCalledWith('v1/users/getAll?page=0');
    expect(component.users[0].id).toBe(246); expect(component.totalUsers).toBe(1);
  }));
  it('searches trimmed text from the first page and encodes mobile numbers safely', fakeAsync(() => {
    component.page = 7; component.inputString = '  +91   856431 4900  '; component.search(); tick();
    expect(component.page).toBe(1); expect(component.appliedSearch).toBe('+91 856431 4900');
    expect(api.get_private.calls.mostRecent().args[0]).toBe('v1/users/getAll?page=0&q=%2B91+856431+4900');
  }));
  it('preserves the submitted query across pages even while the draft is edited', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.resolve(response(23)));
    component.inputString = 'Anil'; component.search(); tick();
    component.inputString = 'Sara'; component.pageChange(2); tick();
    expect(api.get_private.calls.mostRecent().args[0]).toBe('v1/users/getAll?page=1&q=Anil');
    expect(component.rangeStart).toBe(11); expect(component.rangeEnd).toBe(20);
  }));
  it('clears search and resets the first page, including a blank submission', fakeAsync(() => {
    component.appliedSearch = 'Anil'; component.inputString = 'Anil'; component.page = 5; component.clean(); tick();
    expect(component.appliedSearch).toBe(''); expect(component.page).toBe(1);
    expect(api.get_private.calls.mostRecent().args[0]).toBe('v1/users/getAll?page=0');
    component.inputString = '   '; component.search(); tick();
    expect(component.appliedSearch).toBe('');
  }));
  it('resets totals when no users match', fakeAsync(() => {
    component.totalUsers = 200; api.get_private.and.returnValue(Promise.resolve(response(0)));
    component.search(); tick();
    expect(component.totalUsers).toBe(0); expect(component.users).toEqual([]);
    expect(component.rangeStart).toBe(0); expect(component.rangeEnd).toBe(0); expect(component.loading).toBeFalse();
  }));
  it('ignores stale responses after a newer search or clear', fakeAsync(() => {
    let finishOld: any;
    api.get_private.and.returnValues(new Promise(resolve => finishOld = resolve), Promise.resolve(response(1, 247)));
    component.inputString = 'Anil'; component.search(); component.clean(); tick();
    finishOld(response(1, 246)); tick();
    expect(component.users[0].id).toBe(247); expect(component.appliedSearch).toBe('');
  }));
  it('shows errors separately from no matches and can retry', fakeAsync(() => {
    api.get_private.and.returnValue(Promise.reject(new Error('Offline')));
    component.search(); tick();
    expect(component.errorMessage).toContain('could not be loaded'); expect(component.loading).toBeFalse();
    api.get_private.and.returnValue(Promise.resolve(response())); component.getAllUsers(); tick();
    expect(component.errorMessage).toBe(''); expect(component.users.length).toBe(1);
  }));
  it('recovers if the final page disappears and rejects invalid page changes', fakeAsync(() => {
    component.page = 3;
    api.get_private.and.returnValues(Promise.resolve({ ...response(20), data: [] }), Promise.resolve(response(20)));
    component.getAllUsers(); tick();
    expect(component.page).toBe(2); expect(api.get_private.calls.mostRecent().args[0]).toContain('page=1');
    const calls = api.get_private.calls.count(); component.pageChange(0); component.pageChange(3);
    expect(api.get_private.calls.count()).toBe(calls);
  }));
});

describe('Users search UI', () => {
  let fixture: ComponentFixture<UsersComponent>;
  let api: any;
  beforeEach(async () => {
    api = { get_private: jasmine.createSpy().and.returnValue(Promise.resolve(response(0))), imageUrl: '' };
    await TestBed.configureTestingModule({ imports: [CommonModule, FormsModule, ModalModule.forRoot(), NgxPaginationModule],
      declarations: [UsersComponent], schemas: [NO_ERRORS_SCHEMA], providers: [
        { provide: ApiService, useValue: api }, { provide: Router, useValue: {} },
        { provide: UtilService, useValue: { translate: (text: string) => text, apiErrorHandler: () => {} } }
      ] }).compileComponents();
    fixture = TestBed.createComponent(UsersComponent); fixture.detectChanges();
    await fixture.whenStable(); fixture.detectChanges();
  });
  afterEach(() => fixture.destroy());
  it('supports native form submission and exposes an accessible search label', fakeAsync(() => {
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector('input[type=search]') as HTMLInputElement;
    expect(root.querySelector(`label[for="${input.id}"]`)?.textContent).toContain('Find a user');
    input.value = 'Anil'; input.dispatchEvent(new Event('input'));
    root.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); tick(); fixture.detectChanges();
    expect(api.get_private.calls.mostRecent().args[0]).toContain('q=Anil');
    expect(root.textContent).toContain('No matching users'); expect(root.textContent).toContain('Show all users');
  }));
  it('keeps the search form within a narrow content column', () => {
    const root: HTMLElement = fixture.nativeElement; root.style.width = '360px';
    const bounds = root.querySelector('.users-search')!.getBoundingClientRect();
    for (const element of Array.from(root.querySelectorAll('.users-search-input, .users-search-actions'))) {
      expect(element.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.right);
    }
  });
});
