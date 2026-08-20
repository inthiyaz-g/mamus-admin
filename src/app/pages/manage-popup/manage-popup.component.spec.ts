/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePopupComponent } from './manage-popup.component';

describe('ManagePopupComponent', () => {
  let component: ManagePopupComponent;
  let fixture: ComponentFixture<ManagePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagePopupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ManagePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
