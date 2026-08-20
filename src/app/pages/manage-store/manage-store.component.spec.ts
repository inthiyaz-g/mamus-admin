/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageStoreComponent } from './manage-store.component';

describe('ManageStoreComponent', () => {
  let component: ManageStoreComponent;
  let fixture: ComponentFixture<ManageStoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManageStoreComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManageStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
