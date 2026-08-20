/*
  Authors : initappz (Rahul Jograna)
  Website : https://initappz.com/
  App Name : Grocery Delivery App Ionic7 Capacitor
  This App Template Source code is licensed as per the
  terms found in the Website https://initappz.com/license
  Copyright and Good Faith Purchasers © 2024-present initappz.
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministrantorComponent } from './administrantor.component';

describe('AdministrantorComponent', () => {
  let component: AdministrantorComponent;
  let fixture: ComponentFixture<AdministrantorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdministrantorComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdministrantorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
